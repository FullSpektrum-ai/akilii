import { readJson, requireActor } from '../request.js';
import { runtimeEventsResponse } from '../sse.js';
import { IntegrationHttpError, toIntegrationHttpError } from './errors.js';
import { matchIntegrationRoute } from './router.js';

const JSON_HEADERS = Object.freeze({
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
});

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function requireService(services, name, method) {
  const service = services?.[name];
  if (!service || typeof service[method] !== 'function') {
    throw new IntegrationHttpError(
      503,
      `${name} capability is unavailable.`,
      'CAPABILITY_UNAVAILABLE',
    );
  }
  return service;
}

function subjectBody(actor, body = {}) {
  const safe = body && typeof body === 'object' && !Array.isArray(body) ? { ...body } : {};
  delete safe.subjectId;
  delete safe.userId;
  delete safe.user_id;
  return { ...safe, subjectId: actor.id };
}

export function createIntegrationHttpApi({ services = {} } = {}) {
  async function dispatch(request, context = {}) {
    const actor = requireActor(context);
    const url = new URL(request.url);
    const route = matchIntegrationRoute(request.method, url.pathname);
    if (!route) throw new IntegrationHttpError(404, 'This API route was not found.', 'NOT_FOUND');
    if (!route.name) {
      throw new IntegrationHttpError(405, 'This method is not allowed for this route.', 'METHOD_NOT_ALLOWED');
    }

    if (route.name === 'bootstrap') {
      return json(await requireService(services, 'bootstrap', 'load').load({
        subjectId: actor.id,
        user: actor,
      }));
    }
    if (route.name === 'context.inspect') {
      return json(await requireService(services, 'context', 'inspect').inspect({ subjectId: actor.id }));
    }
    if (route.name === 'threads.list') {
      return json({ threads: await requireService(services, 'threads', 'list').list({ subjectId: actor.id }) });
    }
    if (route.name === 'work.list') {
      return json({ work: await requireService(services, 'work', 'list').list({ subjectId: actor.id }) });
    }

    const body = subjectBody(actor, await readJson(request, { optional: request.method === 'DELETE' }));
    if (route.name === 'context.confirm') {
      return json(await requireService(services, 'context', 'confirm').confirm({ ...body, proposalId: route.params[0] }));
    }
    if (route.name === 'context.reject') {
      return json(await requireService(services, 'context', 'reject').reject({ ...body, proposalId: route.params[0] }));
    }
    if (route.name === 'context.control') {
      return json(await requireService(services, 'context', 'restrict').restrict({ ...body, itemId: route.params[0] }));
    }
    if (route.name === 'context.delete') {
      return json(await requireService(services, 'context', 'remove').remove({ ...body, itemId: route.params[0] }));
    }
    if (route.name === 'threads.create') {
      return json(await requireService(services, 'threads', 'create').create(body), 201);
    }
    if (route.name === 'threads.transition') {
      return json(await requireService(services, 'threads', 'transition').transition({
        ...body,
        id: route.params[0],
      }));
    }
    if (route.name === 'work.create') {
      return json(await requireService(services, 'work', 'create').create(body), 201);
    }
    if (route.name === 'work.transition') {
      return json(await requireService(services, 'work', 'transition').transition({
        ...body,
        id: route.params[0],
      }));
    }
    if (route.name === 'chat.start') {
      const result = await requireService(services, 'chat', 'start').start({
        ...body,
        modality: 'text',
      });
      return runtimeEventsResponse(result.run.events, {
        runId: result.run.runId,
        conversationId: result.request.conversationId,
      });
    }
    if (route.name === 'voice.start') {
      const result = await requireService(services, 'voice', 'start').start({
        ...body,
        modality: 'voice',
      });
      return json({
        runId: result.run.runId,
        episodeId: result.request.episode.id,
        conversationId: result.request.conversationId,
        sdpAnswer: result.run.sdpAnswer,
      }, 201);
    }
    if (route.name === 'voice.transcript') {
      return json(await requireService(services, 'voiceTranscript', 'save').save(body));
    }

    throw new IntegrationHttpError(404, 'This API route was not found.', 'NOT_FOUND');
  }

  async function handle(request, context = {}) {
    try {
      return await dispatch(request, context);
    } catch (error) {
      const mapped = toIntegrationHttpError(error);
      const route = matchIntegrationRoute(request.method, new URL(request.url).pathname);
      const headers = mapped.status === 405 && route?.allowed?.length
        ? { Allow: route.allowed.join(', ') }
        : {};
      return json(
        { error: { code: mapped.code, message: mapped.message } },
        mapped.status,
        headers,
      );
    }
  }

  return Object.freeze({ handle });
}

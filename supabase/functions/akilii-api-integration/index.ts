import postgres from 'npm:postgres@3.4.5';

import { authenticateEdgeRequest, EdgeAuthError } from '../akilii-api-v1/auth.ts';
import { corsHeaders, originAllowed, withCors } from '../akilii-api-v1/cors.ts';
import { composeIntegrationApi } from './composition.ts';

function env(name: string, required = false) {
  const value = Deno.env.get(name)?.trim() || '';
  if (required && !value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const DATABASE_URL = env('DATABASE_URL', true);
const SUPABASE_URL = env('SUPABASE_URL', true);
const SUPABASE_ANON_KEY = env('SUPABASE_ANON_KEY', true);
const EXTRA_ORIGINS = env('AKILII_EXTRA_ORIGINS');
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 4,
  prepare: false,
});

function providerEnvironment() {
  return {
    AKILII_TEXT_PROVIDER: env('AKILII_TEXT_PROVIDER'),
    AKILII_OPENAI_MODEL: env('AKILII_OPENAI_MODEL'),
    AKILII_ANTHROPIC_MODEL: env('AKILII_ANTHROPIC_MODEL'),
    AKILII_REALTIME_MODEL: env('AKILII_REALTIME_MODEL'),
    OPENAI_API_KEY: env('OPENAI_API_KEY'),
    ANTHROPIC_API_KEY: env('ANTHROPIC_API_KEY'),
  };
}

function apiRequest(request: Request) {
  const url = new URL(request.url);
  const marker = url.pathname.indexOf('/api/v1');
  if (marker < 0) return null;
  url.pathname = url.pathname.slice(marker);
  return new Request(url, request);
}

function edgeError(
  status: number,
  message: string,
  code: string,
  origin: string | null,
) {
  return withCors(new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  }), origin);
}

Deno.serve(async request => {
  const origin = request.headers.get('origin');
  if (!originAllowed(origin, EXTRA_ORIGINS)) {
    return edgeError(403, 'Origin is not allowed.', 'ORIGIN_DENIED', null);
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    const routed = apiRequest(request);
    if (!routed) return edgeError(404, 'This API route was not found.', 'NOT_FOUND', origin);
    const actor = await authenticateEdgeRequest({
      request,
      supabaseUrl: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      sql,
    });
    const api = composeIntegrationApi({
      sql,
      actor,
      env: providerEnvironment(),
    });
    return withCors(await api.handle(routed, { actor }), origin);
  } catch (error) {
    if (error instanceof EdgeAuthError) {
      return edgeError(error.status, error.message, error.code, origin);
    }
    console.error(
      'akilii-api-integration',
      error instanceof Error ? error.message : 'unknown error',
    );
    return edgeError(
      503,
      'The akilii service is temporarily unavailable.',
      'SERVICE_UNAVAILABLE',
      origin,
    );
  }
});

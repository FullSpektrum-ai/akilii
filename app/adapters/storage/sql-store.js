const text = value => (typeof value === 'string' ? value : '');

function placeholders(statement) {
  let index = 0;
  return statement.replace(/\?/g, () => `$${++index}`);
}

function ensureActor(actor) {
  const id = text(actor?.id).trim();
  if (!id) throw new TypeError('Authenticated actor is required.');
  return { id };
}

function ensureDatabase(database) {
  if (!database || typeof database.prepare !== 'function' || typeof database.exec !== 'function') {
    throw new TypeError('SQLite database is required.');
  }
  return database;
}

function sqliteScope(database) {
  return Object.freeze({
    async all(statement, args = []) {
      return database.prepare(statement).all(...args);
    },
    async first(statement, args = []) {
      return database.prepare(statement).get(...args) ?? null;
    },
    async run(statement, args = []) {
      const result = database.prepare(statement).run(...args);
      return { changes: Number(result.changes || 0), lastInsertRowid: result.lastInsertRowid ?? null };
    },
  });
}

/**
 * Wrap Node's SQLite interface in the minimal async store used by repositories.
 */
export function createSqliteStore(rawDatabase) {
  const database = ensureDatabase(rawDatabase);
  const scope = sqliteScope(database);

  return Object.freeze({
    ...scope,
    async transaction(work) {
      if (typeof work !== 'function') throw new TypeError('Transaction callback is required.');
      database.exec('BEGIN IMMEDIATE');
      try {
        const result = await work(scope);
        database.exec('COMMIT');
        return result;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
  });
}

function postgresScope(tx) {
  const execute = async (statement, args) => tx.unsafe(placeholders(statement), args);
  return Object.freeze({
    async all(statement, args = []) {
      const rows = await execute(statement, args);
      return [...rows];
    },
    async first(statement, args = []) {
      const rows = await execute(statement, args);
      return rows[0] ?? null;
    },
    async run(statement, args = []) {
      const rows = await execute(statement, args);
      return { changes: Number(rows.count || 0), lastInsertRowid: null };
    },
  });
}

/**
 * Wrap Postgres.js with the same store contract as SQLite.
 * Every operation runs with authenticated RLS claims and the akilii search path.
 */
export function createPostgresStore(sql, rawActor) {
  if (!sql || typeof sql.begin !== 'function') throw new TypeError('Postgres client is required.');
  const actor = ensureActor(rawActor);

  async function session(work) {
    return sql.begin(async tx => {
      await tx`select set_config('request.jwt.claims', ${JSON.stringify({ sub: actor.id, role: 'authenticated' })}, true)`;
      await tx.unsafe('set local role authenticated');
      await tx.unsafe('set local search_path = akilii, pg_catalog');
      return work(postgresScope(tx));
    });
  }

  return Object.freeze({
    async all(statement, args = []) {
      return session(store => store.all(statement, args));
    },
    async first(statement, args = []) {
      return session(store => store.first(statement, args));
    },
    async run(statement, args = []) {
      return session(store => store.run(statement, args));
    },
    async transaction(work) {
      if (typeof work !== 'function') throw new TypeError('Transaction callback is required.');
      return session(work);
    },
  });
}

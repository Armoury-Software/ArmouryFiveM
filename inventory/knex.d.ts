declare module 'knex/lib/dialects/postgres' {
  import { Knex } from 'esbuild-support/knex';
  const client: Knex.Client;
  export = client;
}

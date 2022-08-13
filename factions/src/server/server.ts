import { Server } from './controllers/server.controller';

// eslint-disable-next-line no-unused-vars
const server = new Server('factions', true);

console.warn(
  '[factions server.controller.ts]: The getAllFactionMembersAsync call needs to be revisited, as it does a little too many requests.'
);

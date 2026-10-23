import { createApp } from './app';
import { env } from './config/env';
import { createContainer } from './container';

const server = createApp(createContainer()).listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

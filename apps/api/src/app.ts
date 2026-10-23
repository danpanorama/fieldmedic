import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundRoute } from './common/error-handler';
import { env } from './config/env';
import type { Container } from './container';
import { createAssignmentRoutes } from './modules/assignments/assignment.routes';
import { createMatchRoutes } from './modules/matches/match.routes';

export function createApp({ matchService, assignmentService }: Container) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api', createMatchRoutes(matchService));
  app.use('/api', createAssignmentRoutes(assignmentService));

  app.use(notFoundRoute);
  app.use(errorHandler);
  return app;
}

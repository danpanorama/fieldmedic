import { Router } from 'express';
import { createMatchController } from './match.controller';
import type { MatchService } from './match.service';

export function createMatchRoutes(service: MatchService) {
  const controller = createMatchController(service);
  const router = Router();

  // Medic id comes from the URL until login lands in Sprint 1; then it comes from the session.
  router.get('/medics/:medicId/open-matches', controller.getOpenMatches);

  return router;
}

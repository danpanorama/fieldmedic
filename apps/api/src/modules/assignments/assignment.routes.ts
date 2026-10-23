import { Router } from 'express';
import { validateBody } from '../../common/validate';
import { createAssignmentController } from './assignment.controller';
import { takeMatchSchema } from './assignment.schemas';
import type { AssignmentService } from './assignment.service';

export function createAssignmentRoutes(service: AssignmentService) {
  const controller = createAssignmentController(service);
  const router = Router();

  // Taking a match = creating an assignment (REST: POST to the collection).
  router.post('/medics/:medicId/assignments', validateBody(takeMatchSchema), controller.takeMatch);

  return router;
}

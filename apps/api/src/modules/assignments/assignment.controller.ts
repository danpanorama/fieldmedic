import type { TakeMatchRequest } from '@fieldmedic/shared';
import type { Request, Response } from 'express';
import type { AssignmentService } from './assignment.service';

export function createAssignmentController(service: AssignmentService) {
  return {
    async takeMatch(req: Request<{ medicId: string }, unknown, TakeMatchRequest>, res: Response) {
      const result = await service.takeMatch(req.params.medicId, req.body.matchId);
      res.status(201).json(result);
    },
  };
}

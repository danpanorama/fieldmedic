import type { Request, Response } from 'express';
import type { MatchService } from './match.service';

// Controllers only translate HTTP <-> service calls. No business logic here.
export function createMatchController(service: MatchService) {
  return {
    async getOpenMatches(req: Request<{ medicId: string }>, res: Response) {
      res.json(await service.getOpenMatchesFor(req.params.medicId));
    },
  };
}

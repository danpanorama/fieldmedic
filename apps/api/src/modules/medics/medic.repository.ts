import type { Medic } from './medic.model';

export interface MedicRepository {
  findById(id: string): Promise<Medic | null>;
}

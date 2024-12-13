import { Team } from '../entities/team'

export interface TeamsRepository {
   findById(id: string): Promise<null | Team>

   create(team: Team): Promise<void>
   save(team: Team): Promise<void>
   delete(team: Team): Promise<void>
}

import { Team } from '../entities/team'
import { TeamMember } from '../entities/team-member'
import { TeamDetails } from '../entities/value-objects/team-details'

export type TeamWithMembers = Team & {
   members: TeamMember[]
}

export interface TeamsRepository {
   findDetailsById(id: string): Promise<null | TeamDetails>
   findById(id: string): Promise<null | Team>

   findWithMembersById(id: string): Promise<TeamWithMembers | null>

   create(team: Team): Promise<void>
   delete(team: Team): Promise<void>
}

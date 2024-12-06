import { TeamMember } from '../entities/team-member'
import { TeamMemberWithName } from '../entities/value-objects/team-member-with-name'

export interface TeamMembersRepository {
   findManyByTeamId(id: string): Promise<TeamMember[]>
   findManyWithNameByTeamId(id: string): Promise<TeamMemberWithName[]>

   findById(id: string): Promise<null | TeamMember>
   findWithNameById(id: string): Promise<null | TeamMemberWithName>

   create(teamMember: TeamMember): Promise<void>
   save(teamMember: TeamMember): Promise<void>
}

import { Owner } from '../entities/owner'
import { TeamMember } from '../entities/team-member'
import { TeamMemberDetails } from '../entities/value-objects/team-member-details'
import { TeamMemberWithName } from '../entities/value-objects/team-member-with-name'

export interface TeamMembersRepository {
   findManyByTeamId(id: string): Promise<TeamMember[]>
   findManyWithNameByTeamId(id: string): Promise<TeamMemberWithName[]>

   findById(id: string): Promise<null | TeamMember>
   findWithNameById(id: string): Promise<null | TeamMemberWithName>
   findDetailsById(id: string): Promise<null | TeamMemberDetails>

   create(teamMember: TeamMember): Promise<void>
   save(teamMember: TeamMember): Promise<void>
   removeOwner(owner: Owner): Promise<void>
}

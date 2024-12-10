import { Owner } from '../entities/owner'
import { TeamMember } from '../entities/team-member'
import { TeamMemberDetails } from '../entities/value-objects/team-member-details'
import { TeamMemberWithName } from '../entities/value-objects/team-member-with-name'

export interface FindByUserIdAndTeamIdProps {
   userId: string
   teamId: string
}

export interface TeamMembersRepository {
   findManyByTeamId(id: string, status?: boolean): Promise<TeamMember[]>

   findManyWithNameByTeamId(
      id: string,
      status?: boolean,
   ): Promise<TeamMemberWithName[]>

   findById(id: string): Promise<null | TeamMember>
   findDetailsById(id: string): Promise<null | TeamMemberDetails>
   findWithNameById(id: string): Promise<null | TeamMemberWithName>

   findByUserIdAndTeamId(
      props: FindByUserIdAndTeamIdProps,
   ): Promise<TeamMember | null>

   create(teamMember: TeamMember): Promise<void>
   save(teamMember: TeamMember): Promise<void>
   removeOwner(owner: Owner): Promise<void>
}

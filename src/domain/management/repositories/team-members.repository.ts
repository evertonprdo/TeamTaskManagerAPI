import { Owner } from '../entities/owner'
import { TeamMember } from '../entities/team-member'
import { TeamMemberWithName } from '../entities/value-objects/team-member-with-name'

export interface FindByUserIdAndTeamIdProps {
   userId: string
   teamId: string
}

export interface TeamMembersRepository {
   fetchUserIdsToNotifyOnTeamDelete(teamId: string): Promise<string[]>

   findManyWithNameByTeamId(
      id: string,
      status?: boolean,
   ): Promise<TeamMemberWithName[]>

   findById(id: string): Promise<null | TeamMember>
   findWithNameById(id: string): Promise<null | TeamMemberWithName>

   findByUserIdAndTeamId(
      props: FindByUserIdAndTeamIdProps,
   ): Promise<TeamMember | null>

   create(teamMember: TeamMember): Promise<void>
   save(teamMember: TeamMember): Promise<void>
   removeOwner(owner: Owner): Promise<void>
}

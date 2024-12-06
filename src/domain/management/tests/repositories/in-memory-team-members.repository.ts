import { TeamMember, TeamMemberRole } from '../../entities/team-member'
import { TeamMemberWithName } from '../../entities/value-objects/team-member-with-name'

import { OwnersRepository } from '../../repositories/owners.repository'
import { TeamMembersRepository } from '../../repositories/team-members.repository'
import { InMemoryUsersRepository } from './in-memory-users.repository'

export class InMemoryTeamMembersRepository
   implements TeamMembersRepository, OwnersRepository
{
   public items: TeamMember[] = []

   constructor(public usersRepository: InMemoryUsersRepository) {}

   async findManyByTeamId(id: string) {
      const teamMembers = this.items.filter(
         (item) => item.teamId.toString() === id,
      )

      return teamMembers
   }

   async findManyWithNameByTeamId(id: string) {
      const teamMembers = this.items.filter(
         (item) => item.teamId.toString() === id,
      )

      const teamMembersWithName: TeamMemberWithName[] = []

      for (const member of teamMembers) {
         const user = await this.usersRepository.findById(
            member.userId.toString(),
         )

         if (!user) {
            throw new Error()
         }

         const role = member.constructor.name.toUpperCase() as TeamMemberRole

         teamMembersWithName.push(
            TeamMemberWithName.create({
               id: member.id,
               name: user.name,
               email: user.email,
               role,
               status: member.status,
               userId: user.id,
               teamId: member.teamId,
               createdAt: member.createdAt,
            }),
         )
      }

      return teamMembersWithName
   }

   async findById(id: string): Promise<null | TeamMember> {
      const teamMember = this.items.find((item) => item.id.toString() === id)

      if (!teamMember) {
         return null
      }

      return teamMember
   }

   findWithNameById(id: string): Promise<null | TeamMemberWithName> {
      throw new Error('Method not implemented.')
   }

   async create(teamMember: TeamMember): Promise<void> {
      this.items.push(teamMember)
   }
}

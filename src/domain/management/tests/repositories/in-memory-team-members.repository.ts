import { DomainEvents } from '@/core/events/domain-events'

import { Admin } from '../../entities/admin'
import { Owner } from '../../entities/owner'
import { TeamMember, TeamMemberRole } from '../../entities/team-member'
import { TeamMemberDetails } from '../../entities/value-objects/team-member-details'
import { TeamMemberWithName } from '../../entities/value-objects/team-member-with-name'

import { TeamMembersRepository } from '../../repositories/team-members.repository'
import { InMemoryUsersRepository } from './in-memory-users.repository'

export class InMemoryTeamMembersRepository implements TeamMembersRepository {
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

   async findDetailsById(id: string): Promise<null | TeamMemberDetails> {
      const teamMember = this.items.find((item) => item.id.toString() === id)

      if (!teamMember) {
         return null
      }

      const user = await this.usersRepository.findById(
         teamMember.userId.toString(),
      )

      if (!user) {
         throw new Error()
      }

      const role = teamMember.constructor.name.toUpperCase() as TeamMemberRole

      return TeamMemberDetails.create({
         id: teamMember.id,
         name: user.name,
         email: user.email,
         role,
         status: teamMember.status,
         teamId: teamMember.teamId,
         userId: user.id,
         tasks: [],
         createdAt: teamMember.createdAt,
      })
   }

   async create(teamMember: TeamMember): Promise<void> {
      this.items.push(teamMember)
   }

   async save(teamMember: TeamMember): Promise<void> {
      const memberIndex = this.items.findIndex((item) =>
         item.id.equals(teamMember.id),
      )

      if (memberIndex < 0) {
         throw new Error()
      }

      this.items[memberIndex] = teamMember
      DomainEvents.dispatchEventsForAggregate(teamMember.id)
   }

   async removeOwner(owner: Owner): Promise<void> {
      const ownerIndex = this.items.findIndex((item) =>
         item.id.equals(owner.id),
      )

      if (ownerIndex < 0) {
         throw new Error()
      }

      this.items[ownerIndex] = Admin.create(
         {
            teamId: owner.teamId,
            userId: owner.userId,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt,
            status: owner.status,
         },
         owner.id,
      )
      DomainEvents.dispatchEventsForAggregate(owner.id)
   }
}

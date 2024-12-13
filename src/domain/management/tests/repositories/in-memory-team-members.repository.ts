import { DomainEvents } from '@/core/events/domain-events'

import { Admin } from '../../entities/admin'
import { Owner } from '../../entities/owner'
import { TeamMember, TeamMemberRole } from '../../entities/team-member'
import { TeamMemberDetails } from '../../entities/value-objects/team-member-details'
import { TeamMemberWithName } from '../../entities/value-objects/team-member-with-name'

import {
   FindByUserIdAndTeamIdProps,
   TeamMembersRepository,
} from '../../repositories/team-members.repository'
import { InMemoryDatabase } from './in-memory-database'
import { Member } from '../../entities/member'

const TABLE = 'team_members'

export class InMemoryTeamMembersRepository implements TeamMembersRepository {
   constructor(private db: InMemoryDatabase) {}

   async findManyWithNameByTeamId(id: string) {
      const teamMembers = this.db[TABLE].filter(
         (item) => item.teamId.toString() === id,
      )

      const teamMembersWithName: TeamMemberWithName[] = []

      for (const member of teamMembers) {
         const user = this.db.users.find((item) =>
            item.id.equals(member.userId),
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

   async findManyUserIdsByTeamIdAndActive(teamId: string): Promise<string[]> {
      const teamMembers = this.db.team_members
         .filter((item) => item.teamId.toString() === teamId)
         .filter((item) => item.status === 'ACTIVE')
         .filter((item) => !(item instanceof Owner))

      return teamMembers.map((teamMember) => teamMember.userId.toString())
   }

   async findById(id: string): Promise<null | TeamMember> {
      const teamMember = this.db[TABLE].find(
         (item) => item.id.toString() === id,
      )

      if (!teamMember) {
         return null
      }

      return teamMember
   }

   async findWithNameById(id: string): Promise<null | TeamMemberWithName> {
      const member = this.db.team_members.find(
         (item) => item.id.toString() === id,
      )

      if (!member) {
         return null
      }

      const user = this.db.users.find((item) => item.id.equals(member.userId))

      if (!user) {
         throw new Error()
      }

      const memberWithName = TeamMemberWithName.create({
         id: member.id,
         name: user.name,
         email: user.email,
         status: member.status,
         role: member.constructor.name.toUpperCase() as TeamMemberRole,
         teamId: member.teamId,
         userId: member.userId,
         createdAt: member.createdAt,
      })

      return memberWithName
   }

   async findByUserIdAndTeamId({
      teamId,
      userId,
   }: FindByUserIdAndTeamIdProps): Promise<TeamMember | null> {
      const teamMember = this.db[TABLE].find(
         (item) =>
            item.teamId.toString() === teamId &&
            item.userId.toString() === userId,
      )

      if (!teamMember) {
         return null
      }

      return teamMember
   }

   async create(teamMember: TeamMember): Promise<void> {
      this.db[TABLE].push(teamMember)

      DomainEvents.dispatchEventsForAggregate(teamMember.id)
   }

   async save(teamMember: TeamMember): Promise<void> {
      const memberIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(teamMember.id),
      )

      if (memberIndex < 0) {
         throw new Error()
      }

      this.db[TABLE][memberIndex] = teamMember
      DomainEvents.dispatchEventsForAggregate(teamMember.id)
   }

   async removeOwner(owner: Owner): Promise<void> {
      const ownerIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(owner.id),
      )

      if (ownerIndex < 0) {
         throw new Error()
      }

      this.db[TABLE][ownerIndex] = Admin.create(
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

   async removeInvited(teamMember: Admin | Member): Promise<void> {
      const memberIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(teamMember.id),
      )

      if (memberIndex < 0) {
         throw new Error()
      }

      this.db[TABLE].splice(memberIndex, 1)
   }
}

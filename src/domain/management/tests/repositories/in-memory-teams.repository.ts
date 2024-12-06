import { DomainEvents } from '@/core/events/domain-events'

import { Team } from '../../entities/team'
import {
   TeamsRepository,
   TeamWithMembers,
} from '../../repositories/teams.repository'
import { InMemoryTeamMembersRepository } from './in-memory-team-members.repository'
import { TeamDetails } from '../../entities/value-objects/team-details'

export class InMemoryTeamsRepository implements TeamsRepository {
   public items: Team[] = []

   constructor(public teamMembersRepository: InMemoryTeamMembersRepository) {}

   async findDetailsById(id: string) {
      const team = this.items.find((item) => item.id.toString() === id)

      if (!team) {
         return null
      }

      const teamMembers =
         await this.teamMembersRepository.findManyWithNameByTeamId(id)

      const ownerIndex = teamMembers.findIndex(
         (member) => member.role === 'OWNER',
      )

      if (ownerIndex < 0) {
         throw new Error()
      }

      const owner = teamMembers[ownerIndex]
      teamMembers.splice(ownerIndex, 1)

      return TeamDetails.create({
         id: team.id,
         teamName: team.name,
         description: team.description,
         ownerId: owner.id,
         ownerName: owner.name,
         teamMembers,
         tasks: [],
      })
   }

   async findWithMembersById(id: string) {
      const team = this.items.find(
         (item) => item.id.toString() === id,
      ) as TeamWithMembers

      if (!team) {
         return null
      }

      team.members = await this.teamMembersRepository.findManyByTeamId(id)
      return team
   }

   async findById(id: string) {
      const team = this.items.find((item) => item.id.toString() === id)

      if (!team) {
         return null
      }

      return team
   }

   async create(team: Team): Promise<void> {
      this.items.push(team)
   }

   async delete(team: Team) {
      const teamIndex = this.items.findIndex((item) => item.id.equals(team.id))

      if (teamIndex < 0) {
         throw new Error()
      }

      this.items.splice(teamIndex, 1)
      DomainEvents.dispatchEventsForAggregate(team.id)
   }
}

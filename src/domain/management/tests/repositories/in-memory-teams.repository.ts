import { DomainEvents } from '@/core/events/domain-events'

import { Team } from '../../entities/team'
import { TeamDetails } from '../../entities/value-objects/team-details'

import { InMemoryTeamMembersRepository } from './in-memory-team-members.repository'
import { InMemoryTasksRepository } from './in-memory-tasks.repository'

import {
   TeamsRepository,
   TeamWithMembers,
} from '../../repositories/teams.repository'

export class InMemoryTeamsRepository implements TeamsRepository {
   public items: Team[] = []

   constructor(
      public teamMembersRepository: InMemoryTeamMembersRepository,
      public tasksRepository: InMemoryTasksRepository,
   ) {}

   async findDetailsById(id: string) {
      const team = this.items.find((item) => item.id.toString() === id)

      if (!team) {
         return null
      }

      const tasks = await this.tasksRepository.findManyByTeamId(id)
      const teamMembers =
         await this.teamMembersRepository.findManyWithNameByTeamId(id)

      return TeamDetails.create({
         id: team.id,
         teamName: team.name,
         description: team.description,
         teamMembers,
         tasks,
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

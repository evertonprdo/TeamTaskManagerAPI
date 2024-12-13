import { DomainEvents } from '@/core/events/domain-events'

import { Team } from '../../entities/team'

import { TeamsRepository } from '../../repositories/teams.repository'

import { InMemoryDatabase } from './in-memory-database'

const TABLE = 'teams'

export class InMemoryTeamsRepository implements TeamsRepository {
   constructor(private db: InMemoryDatabase) {}

   async findById(id: string) {
      const team = this.db[TABLE].find((item) => item.id.toString() === id)

      if (!team) {
         return null
      }

      return team
   }

   async create(team: Team): Promise<void> {
      this.db[TABLE].push(team)
   }

   async save(team: Team): Promise<void> {
      const teamIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(team.id),
      )

      if (teamIndex < 0) {
         throw new Error()
      }

      this.db[TABLE][teamIndex] = team
   }

   async delete(team: Team) {
      const teamIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(team.id),
      )

      if (teamIndex < 0) {
         throw new Error()
      }

      this.db[TABLE].splice(teamIndex, 1)
      DomainEvents.dispatchEventsForAggregate(team.id)
   }
}

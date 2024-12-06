import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Team } from '../entities/team'

export class TeamRemovedEvent implements DomainEvent {
   public occurredAt: Date
   public team: Team
   public userIds: UniqueEntityID[] = []

   constructor(team: Team, userIds: UniqueEntityID[]) {
      this.occurredAt = new Date()
      this.team = team
      this.userIds = userIds
   }

   getAggregateId(): UniqueEntityID {
      return this.team.id
   }
}

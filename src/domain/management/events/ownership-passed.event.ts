import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'

import { Owner } from '../entities/owner'
import { TeamMember } from '../entities/team-member'

export class OwnershipPassedEvent implements DomainEvent {
   public occurredAt: Date
   public oldOwner: Owner
   public newOwner: TeamMember

   constructor(oldOwner: Owner, newOwner: TeamMember) {
      this.occurredAt = new Date()
      this.oldOwner = oldOwner
      this.newOwner = newOwner
   }

   getAggregateId(): UniqueEntityID {
      return this.oldOwner.id
   }
}

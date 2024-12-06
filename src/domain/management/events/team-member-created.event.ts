import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Member } from '../entities/member'

export class TeamMemberCreatedEvent implements DomainEvent {
   public occurredAt: Date
   public teamMember: Admin | Member
   public createdBy: Admin | Owner

   constructor(teamMember: Admin | Member, createdBy: Admin | Owner) {
      this.occurredAt = new Date()
      this.teamMember = teamMember
      this.createdBy = createdBy
   }

   getAggregateId(): UniqueEntityID {
      return this.teamMember.id
   }
}

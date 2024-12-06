import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Admin } from '../entities/admin'
import { Member } from '../entities/member'

export class TeamMemberAcceptedInvitationEvent implements DomainEvent {
   public occurredAt: Date
   public teamMember: Admin | Member

   constructor(teamMember: Admin | Member) {
      this.occurredAt = new Date()
      this.teamMember = teamMember
   }

   getAggregateId(): UniqueEntityID {
      return this.teamMember.id
   }
}

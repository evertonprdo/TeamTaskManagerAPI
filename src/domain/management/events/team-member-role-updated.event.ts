import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'

import { Owner } from '../entities/owner'
import { Admin } from '../entities/admin'
import { Member } from '../entities/member'

export class TeamMemberRoleUpdatedEvent implements DomainEvent {
   public occurredAt: Date
   public teamMember: Admin | Member
   public changedBy: Owner | Admin
   public oldRole: 'ADMIN' | 'MEMBER'

   constructor(
      teamMember: Admin | Member,
      changedBy: Owner | Admin,
      oldRole: 'ADMIN' | 'MEMBER',
   ) {
      this.occurredAt = new Date()
      this.teamMember = teamMember
      this.changedBy = changedBy
      this.oldRole = oldRole
   }

   getAggregateId(): UniqueEntityID {
      return this.teamMember.id
   }
}

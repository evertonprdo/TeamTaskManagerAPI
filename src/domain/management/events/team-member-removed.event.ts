import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'

import { Admin } from '../entities/admin'
import { Member } from '../entities/member'
import { TeamMember } from '../entities/team-member'

export class TeamMemberRemovedEvent implements DomainEvent {
   public occurredAt: Date
   public teamMember: Admin | Member
   public removedBy: TeamMember

   constructor(teamMember: Admin | Member, removedBy: TeamMember) {
      this.occurredAt = new Date()
      this.teamMember = teamMember
      this.removedBy = removedBy
   }

   getAggregateId(): UniqueEntityID {
      return this.teamMember.id
   }
}

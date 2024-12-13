import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task } from '../entities/task'
import { TeamMember } from '../entities/team-member'

export class TaskCreatedEvent implements DomainEvent {
   public occurredAt: Date
   public task: Task
   public changedBy: TeamMember

   constructor(task: Task, changedBy: TeamMember) {
      this.occurredAt = new Date()
      this.task = task
      this.changedBy = changedBy
   }

   getAggregateId(): UniqueEntityID {
      return this.task.id
   }
}

import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task, TaskStatus } from '../entities/task'
import { TeamMember } from '../entities/team-member'

export class TaskStatusUpdatedEvent implements DomainEvent {
   public occurredAt: Date
   public task: Task
   public changedBy: TeamMember
   public oldStatus: TaskStatus

   constructor(task: Task, oldStatus: TaskStatus, changedBy: TeamMember) {
      this.occurredAt = new Date()
      this.task = task
      this.oldStatus = oldStatus
      this.changedBy = changedBy
   }

   getAggregateId(): UniqueEntityID {
      return this.task.id
   }
}

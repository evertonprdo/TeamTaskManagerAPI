import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task } from '../entities/task'

export class TaskAssignedEvent implements DomainEvent {
   public occurredAt: Date
   public task: Task

   constructor(task: Task) {
      this.occurredAt = new Date()
      this.task = task
   }

   getAggregateId(): UniqueEntityID {
      return this.task.id
   }
}

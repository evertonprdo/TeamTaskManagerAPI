import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task } from '../entities/task'

export enum TaskAction {
   ASSIGN,
   CREATED,
   DETAILS_UPDATED,
   REMOVED,
}

export class TaskEvent implements DomainEvent {
   public occurredAt: Date
   public task: Task
   public action: TaskAction

   constructor(task: Task, action: TaskAction) {
      this.occurredAt = new Date()
      this.task = task
      this.action = action
   }

   getAggregateId(): UniqueEntityID {
      return this.task.id
   }
}

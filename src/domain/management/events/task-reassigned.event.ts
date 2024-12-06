import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task } from '../entities/task'

export class TaskReassignedEvent implements DomainEvent {
   public occurredAt: Date
   public task: Task
   public oldTeamMember: UniqueEntityID

   constructor(task: Task, oldTeamMember: UniqueEntityID) {
      this.occurredAt = new Date()
      this.task = task
      this.oldTeamMember = oldTeamMember
   }

   getAggregateId(): UniqueEntityID {
      return this.task.id
   }
}

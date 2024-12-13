import { EventHandler } from '@/core/events/event-handler'

import { TaskStatusUpdatedEvent } from '../events/task-status-updated.event'
import { CreateTaskLogUseCase } from '../use-cases/create-task-log.use-case'
import { DomainEvents } from '@/core/events/domain-events'

export class OnTaskStatusUpdated implements EventHandler {
   constructor(private createTaskLog: CreateTaskLogUseCase) {
      this.setupSubscriptions()
   }

   setupSubscriptions() {
      DomainEvents.register(
         this.createNewTaskLog.bind(this),
         TaskStatusUpdatedEvent.name,
      )
   }

   private async createNewTaskLog({
      task,
      changedBy,
      oldStatus,
   }: TaskStatusUpdatedEvent) {
      await this.createTaskLog.execute({
         task,
         changedBy,
         oldStatus: oldStatus,
      })
   }
}

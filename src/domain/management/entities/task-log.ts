import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Entity } from '@/core/entities/entity'

import { TaskStatus } from './task'

export interface TaskLogProps {
   taskId: UniqueEntityID
   changedBy: UniqueEntityID
   oldStatus: TaskStatus
   newStatus: TaskStatus
   changedAt: Date
}

export class TaskLog extends Entity<TaskLogProps> {
   get taskId() {
      return this.props.taskId
   }

   get changedBy() {
      return this.props.changedBy
   }

   get oldStatus() {
      return this.props.oldStatus
   }

   get newStatus() {
      return this.props.newStatus
   }

   get changedAt() {
      return this.props.changedAt
   }

   static create(
      props: Optional<TaskLogProps, 'changedAt'>,
      id?: UniqueEntityID,
   ) {
      const taskLog = new TaskLog(
         {
            ...props,
            changedAt: props.changedAt ?? new Date(),
         },
         id,
      )

      return taskLog
   }
}

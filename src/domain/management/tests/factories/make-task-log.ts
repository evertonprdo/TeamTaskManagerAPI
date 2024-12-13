import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TaskLog, TaskLogProps } from '../../entities/task-log'

export function makeTaskLog(
   overwrite: Partial<TaskLogProps> = {},
   id?: UniqueEntityID,
) {
   const task = TaskLog.create(
      {
         taskId: new UniqueEntityID(),
         changedBy: new UniqueEntityID(),
         newStatus: 'IN_PROGRESS',
         oldStatus: 'PENDING',
         changedAt: new Date(),
         ...overwrite,
      },
      id,
   )

   return task
}

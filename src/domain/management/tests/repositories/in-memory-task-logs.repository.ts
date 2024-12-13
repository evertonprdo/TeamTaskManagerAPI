import { TaskLog } from '../../entities/task-log'
import { InMemoryDatabase } from './in-memory-database'

import { TaskLogsRepository } from '../../repositories/task-logs.repository'

const TABLE = 'task_logs'

export class InMemoryTaskLogsRepository implements TaskLogsRepository {
   constructor(private db: InMemoryDatabase) {}

   async findManyByTaskId(id: string): Promise<TaskLog[]> {
      const taskLogs = this.db.task_logs.filter(
         (item) => item.taskId.toString() === id,
      )

      return taskLogs
   }

   async create(taskLog: TaskLog): Promise<void> {
      this.db[TABLE].push(taskLog)
   }
}

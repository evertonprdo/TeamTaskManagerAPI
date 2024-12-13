import { TaskLog } from '../entities/task-log'

export interface TaskLogsRepository {
   findManyByTaskId(id: string): Promise<TaskLog[]>
   create(taskLog: TaskLog): Promise<void>
}

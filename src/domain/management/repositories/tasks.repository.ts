import { PaginationParams } from '@/core/repositories/pagination-params'

import { Task } from '../entities/task'
import { TaskDetails } from '../entities/value-objects/task-details'
import { TaskWithAssignedTo } from '../entities/value-objects/task-with-assigned-to'

export type FindManyWithAssignedByTeamIdParams = {
   teamId: string
} & PaginationParams

export interface TasksRepository {
   findManyWithAssignedByTeamId(
      params: FindManyWithAssignedByTeamIdParams,
   ): Promise<TaskWithAssignedTo[]>

   findManyByTeamId(id: string): Promise<Task[]>

   findById(id: string): Promise<null | Task>
   findDetailsById(id: string): Promise<null | TaskDetails>

   create(task: Task): Promise<void>
   delete(task: Task): Promise<void>
   save(task: Task): Promise<void>
}

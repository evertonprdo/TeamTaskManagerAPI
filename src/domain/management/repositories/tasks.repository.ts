import { PaginationParams } from '@/core/repositories/pagination-params'

import { Task } from '../entities/task'
import { TaskWithAssignedTo } from '../entities/value-objects/task-with-assigned-to'

export type FindManyWithAssignedByTeamIdParams = {
   teamId: string
} & PaginationParams

export type FindManyByTeamMemberIdParams = {
   teamMemberId: string
} & PaginationParams

export type FindManyByTeamIdParams = {
   teamId: string
} & PaginationParams

export interface TasksRepository {
   findManyWithAssignedByTeamId(
      params: FindManyWithAssignedByTeamIdParams,
   ): Promise<TaskWithAssignedTo[]>

   findManyByTeamMemberId(params: FindManyByTeamMemberIdParams): Promise<Task[]>
   findManyByTeamId(params: FindManyByTeamIdParams): Promise<Task[]>

   findById(id: string): Promise<null | Task>

   create(task: Task): Promise<void>
   save(task: Task): Promise<void>
   delete(task: Task): Promise<void>
}

import { Either, right } from '@/core/either'

import { TaskLog } from '../entities/task-log'
import { TeamMember } from '../entities/team-member'
import { Task, TaskStatus } from '../entities/task'

import { TaskLogsRepository } from '../repositories/task-logs.repository'

export interface CreateTaskLogUseCaseRequest {
   task: Task
   changedBy: TeamMember
   oldStatus: TaskStatus
}

export type CreateTaskLogUseCaseResponse = Either<null, { taskLog: TaskLog }>

export class CreateTaskLogUseCase {
   constructor(private taskLogsRepository: TaskLogsRepository) {}

   async execute({
      task,
      changedBy,
      oldStatus,
   }: CreateTaskLogUseCaseRequest): Promise<CreateTaskLogUseCaseResponse> {
      const taskLog = TaskLog.create({
         taskId: task.id,
         oldStatus,
         changedBy: changedBy.id,
         newStatus: task.status,
      })

      await this.taskLogsRepository.create(taskLog)

      return right({ taskLog })
   }
}

import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Task } from '../entities/task'
import { TaskDetails } from '../entities/value-objects/task-details'

import { TaskLogsRepository } from '../repositories/task-logs.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'

interface GetTaskDetailsUseCaseRequest {
   task: Task
}

type GetTaskDetailsUseCaseResponse = Either<
   ResourceNotFoundError,
   { taskDetails: TaskDetails }
>

export class GetTaskDetailsUseCase {
   constructor(
      private taskLogsRepository: TaskLogsRepository,
      private teamMembersRepository: TeamMembersRepository,
   ) {}

   async execute({
      task,
   }: GetTaskDetailsUseCaseRequest): Promise<GetTaskDetailsUseCaseResponse> {
      const [taskLogs, assignedTo] = await Promise.all([
         this.taskLogsRepository.findManyByTaskId(task.id.toString()),
         task.assignedToId &&
            this.teamMembersRepository.findWithNameById(
               task.assignedToId.toString(),
            ),
      ])

      if (task.assignedToId && !assignedTo) {
         return left(new ResourceNotFoundError())
      }

      const taskDetails = TaskDetails.create({
         id: task.id,
         title: task.title,
         description: task.description,
         status: task.status,
         priority: task.priority,
         teamId: task.teamId,
         assignedTo,
         logs: taskLogs,
         createdAt: task.createdAt,
         updatedAt: task.updatedAt,
      })

      return right({ taskDetails })
   }
}

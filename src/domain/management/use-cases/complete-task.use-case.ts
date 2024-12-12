import { Either, left, right } from '@/core/either'

import { Task } from '../entities/task'
import { Member } from '../entities/member'
import { TeamMember } from '../entities/team-member'

import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { TaskAlreadyCompletedError } from './errors/task-already-completed.error'

import { TasksRepository } from '../repositories/tasks.repository'

interface CompleteTaskUseCaseRequest {
   taskId: string
   updatedBy: TeamMember
}

type CompleteTaskUseCaseResponse = Either<ResourceNotFoundError, { task: Task }>

export class CompleteTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      taskId,
      updatedBy,
   }: CompleteTaskUseCaseRequest): Promise<CompleteTaskUseCaseResponse> {
      const task = await this.tasksRepository.findById(taskId)

      if (!task) {
         return left(new ResourceNotFoundError())
      }

      if (
         updatedBy instanceof Member &&
         !task.assignedToId?.equals(updatedBy.id)
      ) {
         return left(new NotAllowedError())
      }

      if (task.status !== 'IN_PROGRESS') {
         return left(new TaskAlreadyCompletedError())
      }

      task.complete(updatedBy)
      await this.tasksRepository.save(task)

      return right({ task })
   }
}

import { Either, left, right } from '@/core/either'

import { Task } from '../entities/task'
import { Member } from '../entities/member'
import { TeamMember } from '../entities/team-member'

import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { TaskAlreadyInProgressError } from './errors/task-already-in-progress.error'

import { TasksRepository } from '../repositories/tasks.repository'

interface StartTaskUseCaseRequest {
   taskId: string
   updatedBy: TeamMember
}

type StartTaskUseCaseResponse = Either<
   ResourceNotFoundError | TaskAlreadyInProgressError,
   { task: Task }
>

export class StartTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      taskId,
      updatedBy,
   }: StartTaskUseCaseRequest): Promise<StartTaskUseCaseResponse> {
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

      if (task.status !== 'PENDING') {
         return left(new TaskAlreadyInProgressError())
      }

      task.start(updatedBy)

      await this.tasksRepository.save(task)
      return right({ task })
   }
}

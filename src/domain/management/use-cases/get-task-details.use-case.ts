import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TaskDetails } from '../entities/value-objects/task-details'
import { TasksRepository } from '../repositories/tasks.repository'

interface GetTaskDetailsUseCaseRequest {
   taskId: string
}

type GetTaskDetailsUseCaseResponse = Either<
   ResourceNotFoundError,
   { task: TaskDetails }
>

export class GetTaskDetailsUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      taskId,
   }: GetTaskDetailsUseCaseRequest): Promise<GetTaskDetailsUseCaseResponse> {
      const task = await this.tasksRepository.findDetailsById(taskId)

      if (!task) {
         return left(new ResourceNotFoundError())
      }

      return right({ task })
   }
}

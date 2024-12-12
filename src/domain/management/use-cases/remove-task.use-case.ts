import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { TasksRepository } from '../repositories/tasks.repository'

interface RemoveTaskUseCaseRequest {
   taskId: string
}

type RemoveTaskUseCaseResponse = Either<ResourceNotFoundError, null>

export class RemoveTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      taskId,
   }: RemoveTaskUseCaseRequest): Promise<RemoveTaskUseCaseResponse> {
      const task = await this.tasksRepository.findById(taskId)

      if (!task) {
         return left(new ResourceNotFoundError())
      }

      this.tasksRepository.delete(task)

      return right(null)
   }
}

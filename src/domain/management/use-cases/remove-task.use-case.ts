import { Either, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Task } from '../entities/task'
import { TasksRepository } from '../repositories/tasks.repository'

interface RemoveTaskUseCaseRequest {
   task: Task
}

type RemoveTaskUseCaseResponse = Either<ResourceNotFoundError, null>

export class RemoveTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      task,
   }: RemoveTaskUseCaseRequest): Promise<RemoveTaskUseCaseResponse> {
      this.tasksRepository.delete(task)

      return right(null)
   }
}

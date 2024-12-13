import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Task } from '../../entities/task'
import { TasksRepository } from '../../repositories/tasks.repository'

interface GetTaskUseCaseRequest {
   taskId: string
   isActive?: boolean
}

type GetTaskUseCaseResponse = Either<ResourceNotFoundError, { task: Task }>

export class GetTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      taskId,
   }: GetTaskUseCaseRequest): Promise<GetTaskUseCaseResponse> {
      const task = await this.tasksRepository.findById(taskId)

      if (!task) {
         return left(new ResourceNotFoundError())
      }

      return right({ task })
   }
}

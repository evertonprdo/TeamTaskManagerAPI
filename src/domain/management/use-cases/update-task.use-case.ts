import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Task, TaskPriority } from '../entities/task'
import { TasksRepository } from '../repositories/tasks.repository'

interface UpdateTaskUseCaseRequest {
   taskId: string
   title: string
   description: string
   priority: TaskPriority
}

type UpdateTaskUseCaseResponse = Either<ResourceNotFoundError, { task: Task }>

export class UpdateTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      taskId,
      title,
      priority,
      description,
   }: UpdateTaskUseCaseRequest): Promise<UpdateTaskUseCaseResponse> {
      const task = await this.tasksRepository.findById(taskId)

      if (!task) {
         return left(new ResourceNotFoundError())
      }

      task.title = title
      task.priority = priority
      task.description = description

      await this.tasksRepository.save(task)

      return right({ task })
   }
}

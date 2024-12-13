import { Either, right } from '@/core/either'

import { Task, TaskPriority } from '../entities/task'
import { TasksRepository } from '../repositories/tasks.repository'

interface UpdateTaskUseCaseRequest {
   task: Task
   title: string
   description: string
   priority: TaskPriority
}

type UpdateTaskUseCaseResponse = Either<null, { task: Task }>

export class UpdateTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      task,
      title,
      priority,
      description,
   }: UpdateTaskUseCaseRequest): Promise<UpdateTaskUseCaseResponse> {
      task.title = title
      task.priority = priority
      task.description = description

      await this.tasksRepository.save(task)

      return right({ task })
   }
}

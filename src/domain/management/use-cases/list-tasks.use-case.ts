import { Either, right } from '@/core/either'

import { Task } from '../entities/task'
import { TasksRepository } from '../repositories/tasks.repository'

interface ListTasksUseCaseRequest {
   teamId: string
   page: number
}

type ListTasksUseCaseResponse = Either<null, { tasks: Task[] }>

export class ListTasksUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      teamId,
      page,
   }: ListTasksUseCaseRequest): Promise<ListTasksUseCaseResponse> {
      const tasks = await this.tasksRepository.findManyByTeamId({
         teamId,
         page,
      })

      return right({ tasks })
   }
}

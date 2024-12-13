import { Either, right } from '@/core/either'

import { TasksRepository } from '../repositories/tasks.repository'
import { TaskWithAssignedTo } from '../entities/value-objects/task-with-assigned-to'

interface ListTasksWithAssignedToUseCaseRequest {
   teamId: string
   page: number
}

type ListTasksWithAssignedToUseCaseResponse = Either<
   null,
   { tasks: TaskWithAssignedTo[] }
>

export class ListTasksWithAssignedToUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      teamId,
      page,
   }: ListTasksWithAssignedToUseCaseRequest): Promise<ListTasksWithAssignedToUseCaseResponse> {
      const tasks = await this.tasksRepository.findManyWithAssignedByTeamId({
         teamId,
         page,
      })

      return right({ tasks })
   }
}

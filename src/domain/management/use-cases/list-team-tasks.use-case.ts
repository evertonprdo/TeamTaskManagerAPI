import { Either, right } from '@/core/either'

import { TasksRepository } from '../repositories/tasks.repository'
import { TaskWithAssignedTo } from '../entities/value-objects/task-with-assigned-to'

interface ListTeamTasksUseCaseRequest {
   teamId: string
   page: number
}

type ListTeamTasksUseCaseResponse = Either<
   null,
   { tasks: TaskWithAssignedTo[] }
>

export class ListTeamTasksUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      teamId,
      page,
   }: ListTeamTasksUseCaseRequest): Promise<ListTeamTasksUseCaseResponse> {
      const tasks = await this.tasksRepository.findManyWithAssignedByTeamId({
         teamId,
         page,
      })

      return right({ tasks })
   }
}

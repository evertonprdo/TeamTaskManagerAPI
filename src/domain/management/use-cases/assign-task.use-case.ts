import { Either, left, right } from '@/core/either'

import { ForbiddenError } from '@/core/errors/forbidden.error'

import { Task } from '../entities/task'
import { TeamMember } from '../entities/team-member'

import { TasksRepository } from '../repositories/tasks.repository'

interface AssignTaskUseCaseRequest {
   teamMember: TeamMember
   task: Task
}

type AssignTaskUseCaseResponse = Either<ForbiddenError, { task: Task }>

export class AssignTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      task,
      teamMember,
   }: AssignTaskUseCaseRequest): Promise<AssignTaskUseCaseResponse> {
      if (teamMember.status !== 'ACTIVE') {
         return left(new ForbiddenError())
      }

      task.assignedToId
         ? task.reassign(teamMember.id)
         : task.assign(teamMember.id)

      await this.tasksRepository.save(task)

      return right({ task })
   }
}

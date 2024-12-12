import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Task } from '../entities/task'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TasksRepository } from '../repositories/tasks.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'

interface AssignTaskUseCaseRequest {
   teamMemberId: string
   taskId: string
}

type AssignTaskUseCaseResponse = Either<ResourceNotFoundError, { task: Task }>

export class AssignTaskUseCase {
   constructor(
      private tasksRepository: TasksRepository,
      private teamMembersRepository: TeamMembersRepository,
   ) {}

   async execute({
      taskId,
      teamMemberId,
   }: AssignTaskUseCaseRequest): Promise<AssignTaskUseCaseResponse> {
      const [task, teamMember] = await Promise.all([
         this.tasksRepository.findById(taskId),
         this.teamMembersRepository.findById(teamMemberId),
      ])

      if (!task || !teamMember) {
         return left(new ResourceNotFoundError())
      }

      task.assignedToId instanceof UniqueEntityID
         ? task.reassign(teamMember.id)
         : task.assign(teamMember.id)

      await this.tasksRepository.save(task)

      return right({ task })
   }
}

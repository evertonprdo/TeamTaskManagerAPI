import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Task, TaskPriority } from '../entities/task'

import { TasksRepository } from '../repositories/tasks.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'

interface CreateTaskUseCaseRequest {
   createdBy: Owner | Admin

   title: string
   description: string
   priority: TaskPriority

   assignToId?: string
   teamId: string
}

type CreateTaskUseCaseResponse = Either<ResourceNotFoundError, { task: Task }>

export class CreateTaskUseCase {
   constructor(
      private tasksRepository: TasksRepository,
      private teamMembersRepository: TeamMembersRepository,
   ) {}

   async execute({
      createdBy,
      title,
      teamId,
      priority,
      assignToId,
      description,
   }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
      if (assignToId) {
         const teamMember = await this.teamMembersRepository.findById(
            assignToId,
         )

         if (!teamMember) {
            return left(new ResourceNotFoundError())
         }

         if (teamMember.status !== 'ACTIVE') {
            return left(new ForbiddenError())
         }
      }

      const task = Task.create(
         {
            title,
            description,
            priority,
            teamId: new UniqueEntityID(teamId),
            assignedToId: assignToId
               ? new UniqueEntityID(assignToId)
               : undefined,
         },
         createdBy,
      )

      await this.tasksRepository.create(task)
      return right({ task })
   }
}

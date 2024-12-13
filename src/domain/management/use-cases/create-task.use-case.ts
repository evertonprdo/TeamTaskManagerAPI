import { Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { TeamMember } from '../entities/team-member'
import { Task, TaskPriority } from '../entities/task'

import { TasksRepository } from '../repositories/tasks.repository'

interface CreateTaskUseCaseRequest {
   createdBy: Owner | Admin

   title: string
   description: string
   priority: TaskPriority

   assignTo?: TeamMember
   teamId: string
}

type CreateTaskUseCaseResponse = Either<null, { task: Task }>

export class CreateTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      createdBy,
      title,
      teamId,
      priority,
      assignTo,
      description,
   }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
      const task = Task.create(
         {
            title,
            description,
            priority,
            teamId: new UniqueEntityID(teamId),
            assignedToId: assignTo?.id,
         },
         createdBy,
      )

      await this.tasksRepository.create(task)
      return right({ task })
   }
}

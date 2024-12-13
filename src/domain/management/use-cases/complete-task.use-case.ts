import { Either, left, right } from '@/core/either'

import { Task } from '../entities/task'
import { Member } from '../entities/member'
import { TeamMember } from '../entities/team-member'

import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { NotMemberAssignedError } from './errors/not-member-assigned.error'
import { TaskAlreadyCompletedError } from './errors/task-already-completed.error'

import { TasksRepository } from '../repositories/tasks.repository'

interface CompleteTaskUseCaseRequest {
   task: Task
   updatedBy: TeamMember
}

type CompleteTaskUseCaseResponse = Either<
   NotAllowedError | TaskAlreadyCompletedError,
   { task: Task }
>

export class CompleteTaskUseCase {
   constructor(private tasksRepository: TasksRepository) {}

   async execute({
      task,
      updatedBy,
   }: CompleteTaskUseCaseRequest): Promise<CompleteTaskUseCaseResponse> {
      if (
         updatedBy instanceof Member &&
         !task.assignedToId?.equals(updatedBy.id)
      ) {
         return left(new NotMemberAssignedError())
      }

      if (task.status !== 'IN_PROGRESS') {
         return left(new TaskAlreadyCompletedError())
      }

      task.complete(updatedBy)
      await this.tasksRepository.save(task)

      return right({ task })
   }
}

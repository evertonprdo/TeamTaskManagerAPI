import { makeTask } from '../_tests/factories/make-task'
import { makeMember } from '../_tests/factories/make-member'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../_tests/repositories/in-memory-tasks.repository'

import { TaskAlreadyCompletedError } from './errors/task-already-completed.error'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CompleteTaskUseCase } from './complete-task.use-case'
import { NotMemberAssignedError } from './errors/not-member-assigned.error'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: CompleteTaskUseCase

describe('Use case: Complete task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new CompleteTaskUseCase(tasksRepository)
   })

   it('should complete a task', async () => {
      const member = makeMember()

      const task = makeTask({
         assignedToId: member.id,
         status: 'IN_PROGRESS',
         teamId: member.teamId,
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         task: task,
         updatedBy: member,
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task.status).toEqual('COMPLETED')
   })

   it('should not be possible to complete a task twice', async () => {
      const member = makeMember()

      const task = makeTask({
         assignedToId: member.id,
         status: 'COMPLETED',
         teamId: member.teamId,
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         task: task,
         updatedBy: member,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(TaskAlreadyCompletedError)
   })

   it('should not be possible to a member to complete a task assigned to another member', async () => {
      const member = makeMember()

      const task = makeTask({
         teamId: member.teamId,
         assignedToId: new UniqueEntityID('another-member'),
         status: 'PENDING',
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         task: task,
         updatedBy: member,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotMemberAssignedError)
   })
})

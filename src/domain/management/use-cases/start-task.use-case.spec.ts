import { makeMember } from '../_tests/factories/make-member'
import { makeTask } from '../_tests/factories/make-task'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../_tests/repositories/in-memory-tasks.repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { TaskAlreadyInProgressError } from './errors/task-already-in-progress.error'

import { StartTaskUseCase } from './start-task.use-case'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: StartTaskUseCase

describe('Use case: Start Task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new StartTaskUseCase(tasksRepository)
   })

   it('should start a task', async () => {
      const member = makeMember()

      const task = makeTask({
         teamId: member.teamId,
         assignedToId: member.id,
         status: 'PENDING',
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

      expect(result.value.task.status).toEqual('IN_PROGRESS')
   })

   it('should not be possible to start a task twice', async () => {
      const member = makeMember()
      inMemoryDatabase.team_members.push(member)

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
      expect(result.value).toBeInstanceOf(TaskAlreadyInProgressError)
   })

   it('should not be possible to a member to start a task assigned to another member', async () => {
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
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })
})

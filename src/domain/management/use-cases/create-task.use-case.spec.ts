import { makeAdmin } from '../_tests/factories/make-admin'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../_tests/repositories/in-memory-tasks.repository'

import { CreateTaskUseCase } from './create-task.use-case'

let inMemoryDatabase: InMemoryDatabase

let tasksRepository: InMemoryTasksRepository

let sut: CreateTaskUseCase

describe('Use case: Create task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new CreateTaskUseCase(tasksRepository)
   })

   it('should create a task', async () => {
      const admin = makeAdmin()

      const result = await sut.execute({
         title: 'title',
         description: 'description',
         priority: 'MEDIUM',
         teamId: 'any-uuid',
         createdBy: admin,
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task).toMatchObject({
         title: 'title',
         priority: 'MEDIUM',
         status: 'UNASSIGN',
      })
      expect(result.value.task).toEqual(inMemoryDatabase.tasks[0])
   })

   it('should create an assigned task', async () => {
      const admin = makeAdmin()
      inMemoryDatabase.team_members.push(admin)

      const result = await sut.execute({
         title: 'title',
         description: 'description',
         priority: 'MEDIUM',
         teamId: 'any-uuid',
         createdBy: admin,
         assignTo: admin,
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task).toMatchObject({
         title: 'title',
         priority: 'MEDIUM',
         status: 'PENDING',
         assignedToId: admin.id,
      })
      expect(result.value.task).toEqual(inMemoryDatabase.tasks[0])
   })
})

import { makeTask } from '../../_tests/factories/make-task'

import { InMemoryDatabase } from '../../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../../_tests/repositories/in-memory-tasks.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { GetTaskUseCase } from './get-task.use-case'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: GetTaskUseCase

describe('Use Case: Get Task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new GetTaskUseCase(tasksRepository)
   })

   it('should get a task by id', async () => {
      const task = makeTask()
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         taskId: task.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task).toEqual(inMemoryDatabase.tasks[0])
   })

   it('should return a resource not found error', async () => {
      const task = makeTask()
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         taskId: 'any-uuid',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

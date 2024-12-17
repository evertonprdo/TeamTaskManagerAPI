import { makeTask } from '../_tests/factories/make-task'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../_tests/repositories/in-memory-tasks.repository'

import { RemoveTaskUseCase } from './remove-task.use-case'

let inMemoryDatabase: InMemoryDatabase

let tasksRepository: InMemoryTasksRepository
let sut: RemoveTaskUseCase

describe('Use case: Remove Task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new RemoveTaskUseCase(tasksRepository)
   })

   it('should remove a task', async () => {
      const task = makeTask()
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({ task: task })

      expect(result.isRight()).toBe(true)
      expect(inMemoryDatabase.tasks).toHaveLength(0)
   })
})

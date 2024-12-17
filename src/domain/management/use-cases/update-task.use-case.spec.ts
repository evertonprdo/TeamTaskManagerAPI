import { makeTask } from '../_tests/factories/make-task'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../_tests/repositories/in-memory-tasks.repository'

import { UpdateTaskUseCase } from './update-task.use-case'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: UpdateTaskUseCase

describe('Use case: Update Task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new UpdateTaskUseCase(tasksRepository)
   })

   it('should update a task', async () => {
      const task = makeTask({
         title: 'old-title',
         description: 'old-description',
         priority: 'LOW',
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         title: 'new-title',
         description: 'new-description',
         priority: 'MEDIUM',
         task: task,
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value)
      expect(result.value.task).toMatchObject({
         title: 'new-title',
         description: 'new-description',
         priority: 'MEDIUM',
      })
   })
})

import { makeTask } from '../_tests/factories/make-task'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../_tests/repositories/in-memory-tasks.repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ListTasksUseCase } from './list-tasks.use-case'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: ListTasksUseCase

describe('Use case: List tasks', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new ListTasksUseCase(tasksRepository)
   })

   it('should list tasks by id', async () => {
      const teamId = new UniqueEntityID()

      const tasks = Array.from({ length: 3 }, () => makeTask({ teamId }))
      inMemoryDatabase.tasks.push(...tasks)

      const result = await sut.execute({ teamId: teamId.toString(), page: 1 })

      expect(result.isRight()).toBe(true)
      expect(result.value?.tasks).toHaveLength(3)
      expect(result.value?.tasks).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ id: tasks[0].id }),
            expect.objectContaining({ id: tasks[1].id }),
            expect.objectContaining({ id: tasks[2].id }),
         ]),
      )
   })

   it('should list tasks paginated', async () => {
      const teamId = new UniqueEntityID()

      const tasks = Array.from({ length: 23 }, () => makeTask({ teamId }))
      inMemoryDatabase.tasks.push(...tasks)

      const result = await sut.execute({ teamId: teamId.toString(), page: 2 })

      expect(result.isRight()).toBe(true)
      expect(result.value?.tasks).toHaveLength(3)
   })
})

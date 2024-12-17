import { makeTask } from '../_tests/factories/make-task'
import { makeOwner } from '../_tests/factories/make-owner'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTaskLogsRepository } from '../_tests/repositories/in-memory-task-logs.repository'

import { CreateTaskLogUseCase } from './create-task-log.use-case'

let inMemoryDatabase: InMemoryDatabase
let taskLogsRepository: InMemoryTaskLogsRepository

let sut: CreateTaskLogUseCase

describe('Use Case: Create Task Log', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      taskLogsRepository = new InMemoryTaskLogsRepository(inMemoryDatabase)

      sut = new CreateTaskLogUseCase(taskLogsRepository)
   })

   it('should create a task log', async () => {
      const owner = makeOwner()

      const task = makeTask({
         assignedToId: owner.id,
         teamId: owner.teamId,
         status: 'PENDING',
      })
      const oldStatus = task.status

      task.start(owner)

      const result = await sut.execute({
         task,
         changedBy: owner,
         oldStatus: oldStatus,
      })

      expect(result.isRight()).toBe(true)

      expect(result.value?.taskLog).toMatchObject({
         oldStatus,
         newStatus: task.status,
         changedBy: owner.id,
      })

      expect(inMemoryDatabase.task_logs).toHaveLength(1)
      expect(inMemoryDatabase.task_logs[0].id).toEqual(result.value?.taskLog.id)
   })
})

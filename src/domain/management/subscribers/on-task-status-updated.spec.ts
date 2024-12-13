import { waitFor } from '@/core/tests/utils/wait-for'

import { makeOwner } from '../tests/factories/make-owner'
import { makeTask } from '../tests/factories/make-task'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTaskLogsRepository } from '../tests/repositories/in-memory-task-logs.repository'

import {
   CreateTaskLogUseCase,
   CreateTaskLogUseCaseRequest,
   CreateTaskLogUseCaseResponse,
} from '../use-cases/create-task-log.use-case'

import { OnTaskStatusUpdated } from './on-task-status-updated'

let inMemoryDatabase: InMemoryDatabase
let taskLogsRepository: InMemoryTaskLogsRepository
let tasksRepository: InMemoryTasksRepository

let createTaskLogUseCase: CreateTaskLogUseCase

let createTaskLogExecuteSpy: jest.SpyInstance<
   Promise<CreateTaskLogUseCaseResponse>,
   [CreateTaskLogUseCaseRequest]
>

describe('Subscriber: On task status updated', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)
      taskLogsRepository = new InMemoryTaskLogsRepository(inMemoryDatabase)

      createTaskLogUseCase = new CreateTaskLogUseCase(taskLogsRepository)

      createTaskLogExecuteSpy = jest.spyOn(createTaskLogUseCase, 'execute')

      new OnTaskStatusUpdated(createTaskLogUseCase)
   })

   it('should create a task log when task status is updated', async () => {
      const owner = makeOwner()
      const task = makeTask({
         status: 'PENDING',
         assignedToId: owner.id,
         teamId: owner.id,
      })
      inMemoryDatabase.tasks.push(task)

      task.start(owner)
      await tasksRepository.save(task)

      await waitFor(() => {
         expect(createTaskLogExecuteSpy).toHaveBeenCalled()
      })
   })
})

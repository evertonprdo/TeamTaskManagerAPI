import { makeAdmin } from '../tests/factories/make-admin'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { CreateTaskUseCase } from './create-task.use-case'

let inMemoryDatabase: InMemoryDatabase

let tasksRepository: InMemoryTasksRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: CreateTaskUseCase

describe('Use case: Create task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)
      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new CreateTaskUseCase(tasksRepository, teamMembersRepository)
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
         assignToId: admin.id.toString(),
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

   it('should not be possible to create a assigned task to a member that does not exist', async () => {
      const admin = makeAdmin()

      const result = await sut.execute({
         title: 'title',
         description: 'description',
         priority: 'MEDIUM',
         teamId: 'any-uuid',
         createdBy: admin,
         assignToId: admin.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })

   it('should be forbidden to create a assigned task to a non-active member', async () => {
      const admin = makeAdmin({ status: 'INACTIVE' })
      inMemoryDatabase.team_members.push(admin)

      const result = await sut.execute({
         title: 'title',
         description: 'description',
         priority: 'MEDIUM',
         teamId: 'any-uuid',
         createdBy: admin,
         assignToId: admin.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ForbiddenError)
   })
})

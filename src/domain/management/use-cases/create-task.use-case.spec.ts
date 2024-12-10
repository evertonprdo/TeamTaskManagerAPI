import { makeAdmin } from '../tests/factories/make-admin'

import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { CreateTaskUseCase } from './create-task.use-case'

let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository
let tasksRepository: InMemoryTasksRepository

let sut: CreateTaskUseCase

describe('Use case: Create task', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      tasksRepository = new InMemoryTasksRepository()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         usersRepository,
         tasksRepository,
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
      expect(result.value.task).toEqual(tasksRepository.items[0])
   })

   it('should create an assigned task', async () => {
      const admin = makeAdmin()
      teamMembersRepository.items.push(admin)

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
      expect(result.value.task).toEqual(tasksRepository.items[0])
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
      teamMembersRepository.items.push(admin)

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

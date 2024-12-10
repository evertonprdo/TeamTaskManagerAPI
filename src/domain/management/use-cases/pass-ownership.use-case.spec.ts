import { makeOwner } from '../tests/factories/make-owner'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'

import { PassOwnershipUseCase } from './pass-ownership.use-case'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: PassOwnershipUseCase

describe('Use case: Pass Ownership', () => {
   beforeEach(() => {
      tasksRepository = new InMemoryTasksRepository()
      usersRepository = new InMemoryUsersRepository()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         usersRepository,
         tasksRepository,
      )

      sut = new PassOwnershipUseCase(teamMembersRepository)
   })

   it('should be possible to pass ownership to another team member', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: owner.teamId, status: 'ACTIVE' })

      teamMembersRepository.items.push(member, owner)

      const result = await sut.execute({
         owner,
         passToId: member.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      const newOwner = await teamMembersRepository.findById(
         member.id.toString(),
      )
      const oldOwner = await teamMembersRepository.findById(owner.id.toString())

      expect(newOwner).toBeInstanceOf(Owner)
      expect(oldOwner).toBeInstanceOf(Admin)
   })

   it('should not be possible to pass the ownership to a member that not exist', async () => {
      const owner = makeOwner()

      const result = await sut.execute({
         owner,
         passToId: 'any-uuid',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

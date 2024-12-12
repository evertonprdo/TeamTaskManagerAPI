import { makeOwner } from '../tests/factories/make-owner'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'

import { PassOwnershipUseCase } from './pass-ownership.use-case'
import { InMemoryDatabase } from '../tests/repositories/in-memory-database'

let inMemoryDatabase: InMemoryDatabase
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: PassOwnershipUseCase

describe('Use case: Pass Ownership', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new PassOwnershipUseCase(teamMembersRepository)
   })

   it('should be possible to pass ownership to another team member', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: owner.teamId, status: 'ACTIVE' })

      inMemoryDatabase.team_members.push(member, owner)

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

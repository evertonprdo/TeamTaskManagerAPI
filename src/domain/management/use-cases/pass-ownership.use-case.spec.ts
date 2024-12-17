import { makeOwner } from '../_tests/factories/make-owner'
import { makeMember } from '../_tests/factories/make-member'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTeamMembersRepository } from '../_tests/repositories/in-memory-team-members.repository'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'

import { PassOwnershipUseCase } from './pass-ownership.use-case'

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
         passTo: member,
      })

      expect(result.isRight()).toBe(true)

      const newOwner = await teamMembersRepository.findById(
         member.id.toString(),
      )
      const oldOwner = await teamMembersRepository.findById(owner.id.toString())

      expect(newOwner).toBeInstanceOf(Owner)
      expect(oldOwner).toBeInstanceOf(Admin)
   })
})

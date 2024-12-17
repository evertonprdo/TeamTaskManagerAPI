import { makeMember } from '../../_tests/factories/make-member'

import { InMemoryDatabase } from '../../_tests/repositories/in-memory-database'
import { InMemoryTeamMembersRepository } from '../../_tests/repositories/in-memory-team-members.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { GetTeamMemberUseCase } from './get-team-member.use-case'

let inMemoryDatabase: InMemoryDatabase
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: GetTeamMemberUseCase

describe('Use Case: Get Team', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new GetTeamMemberUseCase(teamMembersRepository)
   })

   it('should get a team by id', async () => {
      const member = makeMember()
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         teamMemberId: member.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toEqual(inMemoryDatabase.team_members[0])
   })

   it('should return a resource not found error', async () => {
      const member = makeMember()
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         teamMemberId: 'any-uuid',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

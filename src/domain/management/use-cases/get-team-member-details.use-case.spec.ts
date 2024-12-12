import { makeMember } from '../tests/factories/make-member'
import { makeUser } from '../tests/factories/make-user'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { GetTeamMemberDetailsUseCase } from './get-team-member-details.use-case'

let inMemoryDatabase: InMemoryDatabase
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: GetTeamMemberDetailsUseCase

describe('Use case: Get Team Member Details', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new GetTeamMemberDetailsUseCase(teamMembersRepository)
   })

   it('should get details about a team member', async () => {
      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const teamMember = makeMember({ userId: user.id })
      inMemoryDatabase.team_members.push(teamMember)

      const result = await sut.execute({
         teamMemberId: teamMember.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMemberDetails).toMatchObject({
         role: 'MEMBER',
         id: teamMember.id,
         userId: user.id,
      })
   })
})

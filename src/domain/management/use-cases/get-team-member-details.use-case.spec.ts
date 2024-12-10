import { makeMember } from '../tests/factories/make-member'
import { makeUser } from '../tests/factories/make-user'

import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'

import { GetTeamMemberDetailsUseCase } from './get-team-member-details.use-case'

let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: GetTeamMemberDetailsUseCase

describe('Use case: Get Team Member Details', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      teamMembersRepository = new InMemoryTeamMembersRepository(usersRepository)

      sut = new GetTeamMemberDetailsUseCase(teamMembersRepository)
   })

   it('should get details about a team member', async () => {
      const user = makeUser()
      usersRepository.items.push(user)

      const teamMember = makeMember({ userId: user.id })
      teamMembersRepository.items.push(teamMember)

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

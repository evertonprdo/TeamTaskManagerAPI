import { makeOwner } from '../tests/factories/make-owner'
import { makeTeam } from '../tests/factories/make-team'
import { makeUser } from '../tests/factories/make-user'

import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'

import { Member } from '../entities/member'
import { InviteUserToTeamUseCase } from './invite-user-to-team.use-case'
import { UserEmailNotFoundError } from './errors/user-email-not-found.error'

let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: InviteUserToTeamUseCase

describe('Use case: Invite user to team', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      teamMembersRepository = new InMemoryTeamMembersRepository(usersRepository)

      sut = new InviteUserToTeamUseCase(usersRepository, teamMembersRepository)
   })

   it('should invite a user to a team by email', async () => {
      const team = makeTeam()

      const owner = makeOwner({ teamId: team.id })
      teamMembersRepository.items.push(owner)

      const user = makeUser()
      usersRepository.items.push(user)

      const result = await sut.execute({
         email: user.email,
         invitedBy: owner,
         role: 'MEMBER',
         team,
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toMatchObject({
         userId: user.id,
         teamId: team.id,
         status: 'INVITED',
      })

      expect(result.value.teamMember).toBeInstanceOf(Member)
   })

   it('should not be possible to invite a user that does not exist', async () => {
      const team = makeTeam()
      const owner = makeOwner({ teamId: team.id })

      const result = await sut.execute({
         email: 'any@email.com',
         invitedBy: owner,
         role: 'MEMBER',
         team,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(UserEmailNotFoundError)
   })
})

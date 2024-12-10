import { makeMember } from '../tests/factories/make-member'
import { makeUser } from '../tests/factories/make-user'

import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { GetTeamMemberDetailsUseCase } from './get-team-member-details.use-case'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: GetTeamMemberDetailsUseCase

describe('Use case: Get Team Member Details', () => {
   beforeEach(() => {
      tasksRepository = new InMemoryTasksRepository()
      usersRepository = new InMemoryUsersRepository()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         usersRepository,
         tasksRepository,
      )

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

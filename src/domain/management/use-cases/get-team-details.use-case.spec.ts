import { makeTeam } from '../tests/factories/make-team'
import { makeUser } from '../tests/factories/make-user'
import { makeOwner } from '../tests/factories/make-owner'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { GetTeamDetailsUseCase } from './get-team-details.use-case'

let usersRepository: InMemoryUsersRepository
let teamsRepository: InMemoryTeamsRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: GetTeamDetailsUseCase

describe('Use case: Get team details', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      teamMembersRepository = new InMemoryTeamMembersRepository(usersRepository)
      teamsRepository = new InMemoryTeamsRepository(teamMembersRepository)

      sut = new GetTeamDetailsUseCase(teamsRepository)
   })

   it('should get team details by id', async () => {
      const team = makeTeam()
      teamsRepository.items.push(team)

      const userOwner = makeUser()
      usersRepository.items.push(userOwner)

      const owner = makeOwner({ teamId: team.id, userId: userOwner.id })
      teamMembersRepository.items.push(owner)

      const users = Array.from({ length: 3 }, () => makeUser())
      usersRepository.items.push(...users)

      const members = users.map((user) =>
         makeMember({ userId: user.id, teamId: team.id }),
      )

      teamMembersRepository.items.push(...members)

      const result = await sut.execute({ teamId: team.id.toString() })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamDetails).toMatchObject({
         id: team.id,
         teamName: team.name,
         description: team.description,
         ownerName: userOwner.name,
         ownerId: owner.id,
      })

      expect(result.value.teamDetails.teamMembers).toHaveLength(3)
      expect(result.value.teamDetails.teamMembers).toMatchObject([
         expect.objectContaining({ id: members[0].id, userId: users[0].id }),
         expect.objectContaining({ id: members[1].id, userId: users[1].id }),
         expect.objectContaining({ id: members[2].id, userId: users[2].id }),
      ])
   })

   it('should not be possible to get details from a team that does not exists', async () => {
      const result = await sut.execute({ teamId: 'any-uuid' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

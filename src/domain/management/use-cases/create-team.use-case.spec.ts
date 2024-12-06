import { makeUser } from '../tests/factories/make-user'

import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Owner } from '../entities/owner'
import { CreateTeamUseCase } from './create-team.use-case'

let teamMembersRepository: InMemoryTeamMembersRepository
let usersRepository: InMemoryUsersRepository
let teamsRepository: InMemoryTeamsRepository

let sut: CreateTeamUseCase

describe('Use case: Create team', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      teamMembersRepository = new InMemoryTeamMembersRepository(usersRepository)
      teamsRepository = new InMemoryTeamsRepository(teamMembersRepository)

      sut = new CreateTeamUseCase(
         usersRepository,
         teamsRepository,
         teamMembersRepository,
      )
   })

   it('should create a team and a owner', async () => {
      const user = makeUser()
      usersRepository.items.push(user)

      const result = await sut.execute({
         userId: user.id.toString(),
         name: 'New Team',
         description: 'New team test',
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.team).toMatchObject({
         name: 'New Team',
         description: 'New team test',
      })
      expect(result.value.owner).toBeInstanceOf(Owner)
   })

   it('should not create a team if a user does not exist', async () => {
      const result = await sut.execute({
         userId: 'any-user',
         name: 'New Team',
         description: 'New team test',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

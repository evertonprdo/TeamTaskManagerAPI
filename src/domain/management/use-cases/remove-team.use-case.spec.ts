import { makeTeam } from '../tests/factories/make-team'

import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { RemoveTeamUseCase } from './remove-team.use-case'

let tasksRepository: InMemoryTasksRepository
let teamMembersRepository: InMemoryTeamMembersRepository
let usersRepository: InMemoryUsersRepository
let teamsRepository: InMemoryTeamsRepository

let sut: RemoveTeamUseCase

describe('Use case: Remove team', () => {
   beforeEach(() => {
      tasksRepository = new InMemoryTasksRepository()
      usersRepository = new InMemoryUsersRepository()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         usersRepository,
         tasksRepository,
      )
      teamsRepository = new InMemoryTeamsRepository(
         teamMembersRepository,
         tasksRepository,
      )

      sut = new RemoveTeamUseCase(teamsRepository)
   })

   it('should remove a team', async () => {
      const team = makeTeam()
      teamsRepository.items.push(team)

      const result = await sut.execute({ teamId: team.id.toString() })

      expect(result.isRight()).toBe(true)
   })

   it('should not be possible to remove a team that does not exist', async () => {
      const result = await sut.execute({ teamId: 'any-uuid' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

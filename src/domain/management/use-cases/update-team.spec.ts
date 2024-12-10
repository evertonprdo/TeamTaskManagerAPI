import { makeTeam } from '../tests/factories/make-team'

import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { UpdateTeamUseCase } from './update-team'

let tasksRepository: InMemoryTasksRepository
let teamMembersRepository: InMemoryTeamMembersRepository
let usersRepository: InMemoryUsersRepository
let teamsRepository: InMemoryTeamsRepository

let sut: UpdateTeamUseCase

describe('Use case: Update team', () => {
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

      sut = new UpdateTeamUseCase(teamsRepository)
   })

   it('should update a team', async () => {
      const team = makeTeam({
         name: 'old-name',
         description: 'old-description',
      })
      teamsRepository.items.push(team)

      const result = await sut.execute({
         teamId: team.id.toString(),
         name: 'new-name',
         description: 'new-description',
      })

      expect(result.isRight()).toBe(true)
      expect(result.value).toEqual({
         team: expect.objectContaining({
            id: team.id,
            name: 'new-name',
            description: 'new-description',
         }),
      })
   })

   it('should return an error when trying to edit a team that does not exist', async () => {
      const result = await sut.execute({
         teamId: 'any-uuid',
         name: 'any-name',
         description: 'any-description',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

import { makeTeam } from '../tests/factories/make-team'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { UpdateTeamUseCase } from './update-team'

let inMemoryDatabase: InMemoryDatabase
let teamsRepository: InMemoryTeamsRepository

let sut: UpdateTeamUseCase

describe('Use case: Update team', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      sut = new UpdateTeamUseCase(teamsRepository)
   })

   it('should update a team', async () => {
      const team = makeTeam({
         name: 'old-name',
         description: 'old-description',
      })
      inMemoryDatabase.teams.push(team)

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

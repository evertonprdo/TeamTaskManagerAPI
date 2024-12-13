import { makeTeam } from '../tests/factories/make-team'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'

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
         team: team,
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
})

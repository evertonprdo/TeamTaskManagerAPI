import { makeTeam } from '../tests/factories/make-team'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { RemoveTeamUseCase } from './remove-team.use-case'

let inMemoryDatabase: InMemoryDatabase
let teamsRepository: InMemoryTeamsRepository

let sut: RemoveTeamUseCase

describe('Use case: Remove team', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      sut = new RemoveTeamUseCase(teamsRepository)
   })

   it('should remove a team', async () => {
      const team = makeTeam()
      inMemoryDatabase.teams.push(team)

      const result = await sut.execute({ teamId: team.id.toString() })

      expect(result.isRight()).toBe(true)
   })

   it('should not be possible to remove a team that does not exist', async () => {
      const result = await sut.execute({ teamId: 'any-uuid' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

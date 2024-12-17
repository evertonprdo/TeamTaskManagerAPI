import { makeTeam } from '../../_tests/factories/make-team'

import { InMemoryDatabase } from '../../_tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '../../_tests/repositories/in-memory-teams.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { GetTeamUseCase } from './get-team.use-case'

let inMemoryDatabase: InMemoryDatabase
let teamsRepository: InMemoryTeamsRepository

let sut: GetTeamUseCase

describe('Use Case: Get Team', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      sut = new GetTeamUseCase(teamsRepository)
   })

   it('should get a team by id', async () => {
      const team = makeTeam()
      inMemoryDatabase.teams.push(team)

      const result = await sut.execute({
         teamId: team.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.team).toEqual(inMemoryDatabase.teams[0])
   })

   it('should return a resource not found error', async () => {
      const team = makeTeam()
      inMemoryDatabase.teams.push(team)

      const result = await sut.execute({
         teamId: 'any-uuid',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

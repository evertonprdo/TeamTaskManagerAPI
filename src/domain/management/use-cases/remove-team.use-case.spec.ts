import { makeTeam } from '../tests/factories/make-team'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { RemoveTeamUseCase } from './remove-team.use-case'

let inMemoryDatabase: InMemoryDatabase
let teamMembersRepository: InMemoryTeamMembersRepository
let teamsRepository: InMemoryTeamsRepository

let sut: RemoveTeamUseCase

describe('Use case: Remove team', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new RemoveTeamUseCase(teamsRepository, teamMembersRepository)
   })

   it('should remove a team', async () => {
      const team = makeTeam()
      inMemoryDatabase.teams.push(team)

      const result = await sut.execute({ team: team })

      expect(result.isRight()).toBe(true)
   })
})

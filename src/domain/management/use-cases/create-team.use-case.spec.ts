import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { Owner } from '../entities/owner'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { CreateTeamUseCase } from './create-team.use-case'

let inMemoryDatabase: InMemoryDatabase

let teamsRepository: InMemoryTeamsRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: CreateTeamUseCase

describe('Use case: Create team', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      sut = new CreateTeamUseCase(teamsRepository, teamMembersRepository)
   })

   it('should create a team and a owner', async () => {
      const result = await sut.execute({
         userId: new UniqueEntityID().toString(),
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

      expect(result.value.owner).toEqual(inMemoryDatabase.team_members[0])
      expect(result.value.team).toEqual(inMemoryDatabase.teams[0])
   })
})

import { InMemoryTeamsRepository } from '../tests/repositories/in-memory-teams.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Owner } from '../entities/owner'
import { CreateTeamUseCase } from './create-team.use-case'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'

let tasksRepository: InMemoryTasksRepository
let teamMembersRepository: InMemoryTeamMembersRepository
let usersRepository: InMemoryUsersRepository
let teamsRepository: InMemoryTeamsRepository

let sut: CreateTeamUseCase

describe('Use case: Create team', () => {
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

      expect(result.value.owner).toEqual(teamMembersRepository.items[0])
      expect(result.value.team).toEqual(teamsRepository.items[0])
   })
})

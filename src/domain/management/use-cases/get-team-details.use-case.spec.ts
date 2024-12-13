import { makeTask } from '../tests/factories/make-task'
import { makeTeam } from '../tests/factories/make-team'
import { makeUser } from '../tests/factories/make-user'
import { makeOwner } from '../tests/factories/make-owner'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { GetTeamDetailsUseCase } from './get-team-details.use-case'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: GetTeamDetailsUseCase

describe('Use case: Get team details', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new GetTeamDetailsUseCase(teamMembersRepository, tasksRepository)
   })

   it('should get team details by id', async () => {
      const team = makeTeam()
      inMemoryDatabase.teams.push(team)

      const userOwner = makeUser()
      inMemoryDatabase.users.push(userOwner)

      const owner = makeOwner({ teamId: team.id, userId: userOwner.id })
      inMemoryDatabase.team_members.push(owner)

      const users = Array.from({ length: 3 }, () => makeUser())
      inMemoryDatabase.users.push(...users)

      const members = users.map((user) =>
         makeMember({ userId: user.id, teamId: team.id }),
      )
      inMemoryDatabase.team_members.push(...members)

      const tasks = Array.from({ length: 23 }, () =>
         makeTask({ teamId: team.id }),
      )
      inMemoryDatabase.tasks.push(...tasks)

      const result = await sut.execute({ team: team })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamDetails).toMatchObject({
         id: team.id,
         teamName: team.name,
         description: team.description,
      })

      expect(result.value.teamDetails.teamMembers).toHaveLength(4)
      expect(result.value.teamDetails.teamMembers).toMatchObject([
         expect.objectContaining({ id: owner.id, role: 'OWNER' }),
         expect.objectContaining({ id: members[0].id, userId: users[0].id }),
         expect.objectContaining({ id: members[1].id, userId: users[1].id }),
         expect.objectContaining({ id: members[2].id, userId: users[2].id }),
      ])

      expect(result.value.teamDetails.tasks).toHaveLength(20)
   })
})

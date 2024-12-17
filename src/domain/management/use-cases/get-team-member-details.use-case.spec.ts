import { makeMember } from '../_tests/factories/make-member'
import { makeTask } from '../_tests/factories/make-task'
import { makeUser } from '../_tests/factories/make-user'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../_tests/repositories/in-memory-tasks.repository'
import { InMemoryUsersRepository } from '../_tests/repositories/in-memory-users.repository'

import { GetTeamMemberDetailsUseCase } from './get-team-member-details.use-case'

let inMemoryDatabase: InMemoryDatabase
let usersRepository: InMemoryUsersRepository
let tasksRepository: InMemoryTasksRepository

let sut: GetTeamMemberDetailsUseCase

describe('Use case: Get Team Member Details', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      usersRepository = new InMemoryUsersRepository(inMemoryDatabase)
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new GetTeamMemberDetailsUseCase(tasksRepository, usersRepository)
   })

   it('should get details about a team member', async () => {
      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const teamMember = makeMember({ userId: user.id })
      inMemoryDatabase.team_members.push(teamMember)

      const tasks = Array.from({ length: 23 }, () =>
         makeTask({
            assignedToId: teamMember.id,
            teamId: teamMember.teamId,
            status: 'PENDING',
         }),
      )
      inMemoryDatabase.tasks.push(...tasks)

      const result = await sut.execute({
         teamMember: teamMember,
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMemberDetails).toMatchObject({
         role: 'MEMBER',
         id: teamMember.id,
         userId: user.id,
         name: user.name,
         email: user.email,
      })

      expect(result.value.teamMemberDetails.tasks).toHaveLength(20)
   })
})

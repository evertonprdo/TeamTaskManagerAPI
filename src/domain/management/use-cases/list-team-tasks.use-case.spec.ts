import { makeTask } from '../tests/factories/make-task'
import { makeTeam } from '../tests/factories/make-team'
import { makeUser } from '../tests/factories/make-user'
import { makeOwner } from '../tests/factories/make-owner'
import { makeAdmin } from '../tests/factories/make-admin'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'

import { ListTeamTasksUseCase } from './list-team-tasks.use-case'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: ListTeamTasksUseCase

describe('Use case: List team tasks', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new ListTeamTasksUseCase(tasksRepository)
   })

   it('should list a team tasks', async () => {
      const team = makeTeam()

      const users = [makeUser(), makeUser(), makeUser()]
      inMemoryDatabase.users.push(...users)

      const members = [
         makeAdmin({ userId: users[0].id, teamId: team.id }),
         makeOwner({ userId: users[2].id, teamId: team.id }),
         makeMember({ userId: users[1].id, teamId: team.id }),
      ]
      inMemoryDatabase.team_members.push(...members)

      const tasks = [
         makeTask({
            assignedToId: members[0].id,
            status: 'PENDING',
            teamId: team.id,
         }),
         makeTask({
            assignedToId: members[1].id,
            status: 'PENDING',
            teamId: team.id,
         }),
         makeTask({
            assignedToId: members[2].id,
            status: 'PENDING',
            teamId: team.id,
         }),
         makeTask({
            teamId: team.id,
            status: 'UNASSIGN',
         }),
      ]
      inMemoryDatabase.tasks.push(...tasks)

      const result = await sut.execute({ teamId: team.id.toString(), page: 1 })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.tasks).toHaveLength(4)
      expect(result.value.tasks).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ id: tasks[0].id }),
            expect.objectContaining({ id: tasks[1].id }),
            expect.objectContaining({ id: tasks[2].id }),
            expect.objectContaining({ id: tasks[3].id, status: 'UNASSIGN' }),
         ]),
      )
   })

   it('should list a team tasks paginated', async () => {
      const team = makeTeam()

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const member = makeOwner({ userId: user.id, teamId: team.id })
      inMemoryDatabase.team_members.push(member)

      const tasks = Array.from({ length: 23 }, () =>
         makeTask({ teamId: team.id }),
      )
      inMemoryDatabase.tasks.push(...tasks)

      const result = await sut.execute({ teamId: team.id.toString(), page: 2 })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.tasks).toHaveLength(3)
   })
})

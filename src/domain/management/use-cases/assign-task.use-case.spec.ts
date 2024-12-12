import { makeTask } from '../tests/factories/make-task'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { AssignTaskUseCase } from './assign-task.use-case'

let inMemoryDatabase: InMemoryDatabase
let teamMembersRepository: InMemoryTeamMembersRepository
let tasksRepository: InMemoryTasksRepository

let sut: AssignTaskUseCase

describe('Use case: Assign task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)
      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new AssignTaskUseCase(tasksRepository, teamMembersRepository)
   })

   it('should be able to assign a team member', async () => {
      const member = makeMember()
      inMemoryDatabase.team_members.push(member)

      const task = makeTask({ teamId: member.teamId })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         taskId: task.id.toString(),
         teamMemberId: member.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task.assignedToId).toEqual(member.id)
      expect(result.value.task.status).toEqual('PENDING')
   })

   it('should be able to reassign a task', async () => {
      const oldMember = makeMember()
      const newMember = makeMember()
      inMemoryDatabase.team_members.push(oldMember, newMember)

      const task = makeTask({
         teamId: oldMember.teamId,
         assignedToId: oldMember.id,
         status: 'IN_PROGRESS',
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         taskId: task.id.toString(),
         teamMemberId: newMember.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task.assignedToId).toEqual(newMember.id)
      expect(result.value.task.status).toEqual('IN_PROGRESS')
   })
})

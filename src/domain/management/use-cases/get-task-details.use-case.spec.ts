import { makeUser } from '../tests/factories/make-user'
import { makeTask } from '../tests/factories/make-task'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTaskLogsRepository } from '../tests/repositories/in-memory-task-logs.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { TaskDetails } from '../entities/value-objects/task-details'
import { TeamMemberWithName } from '../entities/value-objects/team-member-with-name'

import { GetTaskDetailsUseCase } from './get-task-details.use-case'
import { makeTaskLog } from '../tests/factories/make-task-log'

let inMemoryDatabase: InMemoryDatabase
let taskLogsRepository: InMemoryTaskLogsRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: GetTaskDetailsUseCase

describe('Use case: Get Task Details', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      taskLogsRepository = new InMemoryTaskLogsRepository(inMemoryDatabase)

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new GetTaskDetailsUseCase(taskLogsRepository, teamMembersRepository)
   })

   it('should get a task details', async () => {
      const task = makeTask()
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({ task: task })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.taskDetails).toBeInstanceOf(TaskDetails)
      expect(result.value.taskDetails.id).toEqual(task.id)
   })

   it('should get a task with assigned member', async () => {
      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const member = makeMember({ userId: user.id })
      inMemoryDatabase.team_members.push(member)

      const task = makeTask({
         teamId: member.teamId,
         assignedToId: member.id,
         status: 'IN_PROGRESS',
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({ task: task })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.taskDetails).toBeInstanceOf(TaskDetails)
      expect(result.value.taskDetails.id).toEqual(task.id)

      expect(result.value.taskDetails.assignedTo).toBeInstanceOf(
         TeamMemberWithName,
      )

      expect(result.value.taskDetails.assignedTo).toMatchObject({
         id: member.id,
         userId: user.id,
         name: user.name,
      })
   })

   it('should get a task with task logs', async () => {
      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const member = makeMember({ userId: user.id })
      inMemoryDatabase.team_members.push(member)

      const task = makeTask({
         teamId: member.teamId,
         assignedToId: member.id,
         status: 'IN_PROGRESS',
      })
      inMemoryDatabase.tasks.push(task)

      const taskLog1 = makeTaskLog({
         taskId: task.id,
         oldStatus: 'PENDING',
         newStatus: 'IN_PROGRESS',
         changedBy: member.id,
      })

      const taskLog2 = makeTaskLog({
         taskId: task.id,
         oldStatus: 'IN_PROGRESS',
         newStatus: 'COMPLETED',
         changedBy: member.id,
      })
      inMemoryDatabase.task_logs.push(taskLog1, taskLog2)

      const result = await sut.execute({ task: task })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.taskDetails).toBeInstanceOf(TaskDetails)
      expect(result.value.taskDetails.id).toEqual(task.id)

      expect(result.value.taskDetails.logs).toHaveLength(2)
      expect(result.value.taskDetails.logs).toEqual(
         expect.arrayContaining([taskLog1, taskLog2]),
      )
   })
})

import { makeUser } from '../tests/factories/make-user'
import { makeTask } from '../tests/factories/make-task'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'

import { TaskDetails } from '../entities/value-objects/task-details'
import { TeamMemberWithName } from '../entities/value-objects/team-member-with-name'

import { GetTaskDetailsUseCase } from './get-task-details.use-case'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: GetTaskDetailsUseCase

describe('Use case: Get Task Details', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new GetTaskDetailsUseCase(tasksRepository)
   })

   it('should get a task details', async () => {
      const task = makeTask()
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({ taskId: task.id.toString() })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task).toBeInstanceOf(TaskDetails)
      expect(result.value.task.id).toEqual(task.id)
   })

   it('should get a task with assigned member', async () => {
      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const member = makeMember({ userId: user.id })
      inMemoryDatabase.team_members.push(member)

      const task = makeTask({ assignedToId: member.id, status: 'IN_PROGRESS' })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({ taskId: task.id.toString() })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task).toBeInstanceOf(TaskDetails)
      expect(result.value.task.id).toEqual(task.id)

      expect(result.value.task.assignedTo).toBeInstanceOf(TeamMemberWithName)

      expect(result.value.task.assignedTo).toMatchObject({
         id: member.id,
         userId: user.id,
         name: user.name,
      })
   })
})

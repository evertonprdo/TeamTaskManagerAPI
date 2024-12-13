import { makeTask } from '../tests/factories/make-task'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'

import { AssignTaskUseCase } from './assign-task.use-case'
import { ForbiddenError } from '@/core/errors/forbidden.error'

let inMemoryDatabase: InMemoryDatabase
let tasksRepository: InMemoryTasksRepository

let sut: AssignTaskUseCase

describe('Use case: Assign task', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)

      sut = new AssignTaskUseCase(tasksRepository)
   })

   it('should be able to assign a team member', async () => {
      const member = makeMember()

      const task = makeTask({ teamId: member.teamId })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         task: task,
         teamMember: member,
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

      const task = makeTask({
         teamId: oldMember.teamId,
         assignedToId: oldMember.id,
         status: 'IN_PROGRESS',
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         task: task,
         teamMember: newMember,
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.task.assignedToId).toEqual(newMember.id)
      expect(result.value.task.status).toEqual('IN_PROGRESS')
   })

   it('should not be possible to assign a task to a member who is not active', async () => {
      const member = makeMember({ status: 'INACTIVE' })

      const task = makeTask({
         teamId: member.teamId,
         assignedToId: member.id,
         status: 'IN_PROGRESS',
      })
      inMemoryDatabase.tasks.push(task)

      const result = await sut.execute({
         task: task,
         teamMember: member,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ForbiddenError)
   })
})

import { DomainEvents } from '@/core/events/domain-events'

import { Task } from '../../entities/task'
import { TaskDetails } from '../../entities/value-objects/task-details'
import { TeamMemberWithName } from '../../entities/value-objects/team-member-with-name'
import { TaskWithAssignedTo } from '../../entities/value-objects/task-with-assigned-to'

import { TeamMemberRole } from '../../entities/team-member'

import { InMemoryDatabase } from './in-memory-database'
import {
   FindManyWithAssignedByTeamIdParams,
   TasksRepository,
} from '../../repositories/tasks.repository'

const TABLE = 'tasks'

export class InMemoryTasksRepository implements TasksRepository {
   constructor(private db: InMemoryDatabase) {}

   async findManyByTeamId(id: string): Promise<Task[]> {
      const tasks = this.db[TABLE].filter(
         (item) => item.teamId.toString() === id,
      )

      return tasks
   }

   async findManyWithAssignedByTeamId({
      teamId,
      page,
   }: FindManyWithAssignedByTeamIdParams): Promise<TaskWithAssignedTo[]> {
      const tasks = this.db[TABLE].filter(
         (item) => item.teamId.toString() === teamId,
      )
         .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
         .slice((page - 1) * 20, page * 20)

      const tasksWithAssigned = tasks.map((task) => {
         return TaskWithAssignedTo.create({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            teamId: task.teamId,
            assignedTo: this.getTeamMemberWithName(task),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
         })
      })

      return tasksWithAssigned
   }

   async findById(id: string): Promise<null | Task> {
      const task = this.db[TABLE].find((item) => item.id.toString() === id)

      if (!task) {
         return null
      }

      return task
   }

   async findDetailsById(id: string): Promise<null | TaskDetails> {
      const task = this.db[TABLE].find((item) => item.id.toString() === id)

      if (!task) {
         return null
      }

      return TaskDetails.create({
         id: task.id,
         title: task.title,
         description: task.description,
         status: task.status,
         priority: task.priority,
         teamId: task.teamId,
         updatedAt: task.updatedAt,
         createdAt: task.createdAt,
         assignedTo: this.getTeamMemberWithName(task),
         logs: [],
      })
   }

   async create(task: Task): Promise<void> {
      this.db[TABLE].push(task)

      DomainEvents.dispatchEventsForAggregate(task.id)
   }

   async save(task: Task): Promise<void> {
      const taskIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(task.id),
      )

      if (taskIndex < 0) {
         throw new Error()
      }

      this.db[TABLE][taskIndex] = task

      DomainEvents.dispatchEventsForAggregate(task.id)
   }

   async delete(task: Task): Promise<void> {
      const taskIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(task.id),
      )

      if (taskIndex < 0) {
         throw new Error()
      }

      this.db[TABLE].splice(taskIndex, 1)
   }

   private getTeamMemberWithName(task: Task) {
      let assignedTo: TeamMemberWithName | undefined
      const assignedToId = task.assignedToId

      if (assignedToId) {
         const teamMember = this.db.team_members.find((item) =>
            item.id.equals(assignedToId),
         )

         if (!teamMember) {
            throw new Error()
         }

         const user = this.db.users.find((item) =>
            item.id.equals(teamMember.userId),
         )

         if (!user) {
            throw new Error()
         }

         assignedTo = TeamMemberWithName.create({
            id: teamMember.id,
            name: user.name,
            email: user.email,
            status: teamMember.status,
            role: teamMember.constructor.name.toUpperCase() as TeamMemberRole,
            userId: user.id,
            teamId: teamMember.teamId,
            createdAt: teamMember.createdAt,
         })
      }

      return assignedTo
   }
}

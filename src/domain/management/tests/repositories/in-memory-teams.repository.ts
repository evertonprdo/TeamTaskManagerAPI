import { DomainEvents } from '@/core/events/domain-events'

import { Team } from '../../entities/team'
import { TeamDetails } from '../../entities/value-objects/team-details'
import { TaskWithAssignedTo } from '../../entities/value-objects/task-with-assigned-to'
import { TeamMemberWithName } from '../../entities/value-objects/team-member-with-name'

import { TeamMemberRole } from '../../entities/team-member'

import {
   TeamsRepository,
   TeamWithMembers,
} from '../../repositories/teams.repository'

import { InMemoryDatabase } from './in-memory-database'

const TABLE = 'teams'

export class InMemoryTeamsRepository implements TeamsRepository {
   constructor(private db: InMemoryDatabase) {}

   async findDetailsById(id: string) {
      const team = this.db[TABLE].find((item) => item.id.toString() === id)

      if (!team) {
         return null
      }

      const teamMembers = this.db.team_members.reduce<TeamMemberWithName[]>(
         (membersWithName, member) => {
            if (member.teamId.equals(team.id)) {
               const user = this.db.users.find((item) =>
                  item.id.equals(member.userId),
               )

               if (!user) {
                  throw new Error()
               }

               membersWithName.push(
                  TeamMemberWithName.create({
                     id: member.id,
                     name: user.name,
                     email: user.email,
                     role: member.constructor.name.toUpperCase() as TeamMemberRole,
                     status: member.status,
                     teamId: team.id,
                     userId: user.id,
                     createdAt: member.createdAt,
                  }),
               )
            }

            return membersWithName
         },
         [],
      )

      const tasksWithoutAssignedTo = this.db.tasks.filter((item) =>
         item.teamId.equals(team.id),
      )

      const tasks = tasksWithoutAssignedTo.reduce<TaskWithAssignedTo[]>(
         (tasksAcc, task) => {
            const assignedToId = task.assignedToId

            if (assignedToId) {
               const member = teamMembers.find((item) =>
                  item.id.equals(assignedToId),
               )

               if (!member) {
                  throw new Error()
               }

               tasksAcc.push(
                  TaskWithAssignedTo.create({
                     id: task.id,
                     title: task.title,
                     description: task.description,
                     priority: task.priority,
                     status: task.status,
                     teamId: task.teamId,
                     assignedTo: member,
                     createdAt: task.createdAt,
                     updatedAt: task.updatedAt,
                  }),
               )
            }
            return tasksAcc
         },
         [],
      )

      return TeamDetails.create({
         id: team.id,
         teamName: team.name,
         description: team.description,
         teamMembers,
         tasks,
      })
   }

   async findWithMembersById(id: string) {
      const team = this.db[TABLE].find(
         (item) => item.id.toString() === id,
      ) as TeamWithMembers

      if (!team) {
         return null
      }

      team.members = this.db.team_members.filter((item) =>
         item.id.equals(team.id),
      )

      return team
   }

   async findById(id: string) {
      const team = this.db[TABLE].find((item) => item.id.toString() === id)

      if (!team) {
         return null
      }

      return team
   }

   async create(team: Team): Promise<void> {
      this.db[TABLE].push(team)
   }

   async delete(team: Team) {
      const teamIndex = this.db[TABLE].findIndex((item) =>
         item.id.equals(team.id),
      )

      if (teamIndex < 0) {
         throw new Error()
      }

      this.db[TABLE].splice(teamIndex, 1)
      DomainEvents.dispatchEventsForAggregate(team.id)
   }
}

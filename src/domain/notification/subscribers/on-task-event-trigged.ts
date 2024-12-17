import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'

import { Team } from '@/domain/management/entities/team'
import { Task } from '@/domain/management/entities/task'

import { TeamsRepository } from '@/domain/management/repositories/teams.repository'
import { TeamMembersRepository } from '@/domain/management/repositories/team-members.repository'

import { TaskAction, TaskEvent } from '@/domain/management/events/task.event'

import { SendNotificationUseCase } from '../use-cases/send-notification.use-case'

export class OnTaskEventTriggered implements EventHandler {
   constructor(
      private teamsRepository: TeamsRepository,
      private teamMembersRepository: TeamMembersRepository,
      private sendNotification: SendNotificationUseCase,
   ) {
      this.setupSubscriptions()
   }

   setupSubscriptions(): void {
      DomainEvents.register(
         this.sendNotificationToAssigned.bind(this),
         TaskEvent.name,
      )
   }

   private async sendNotificationToAssigned({ task, action }: TaskEvent) {
      const assignedToId = task.assignedToId

      if (!assignedToId) {
         return
      }

      const [team, assignedTo] = await Promise.all([
         this.teamsRepository.findById(task.teamId.toString()),
         this.teamMembersRepository.findById(assignedToId.toString()),
      ])

      if (!team || !assignedTo) {
         return
      }

      let message: { title: string; content: string }

      switch (action) {
         case TaskAction.ASSIGN:
            message = this.buildAssignedMessage(task, team)
            break

         case TaskAction.DETAILS_UPDATED:
            message = this.buildDetailsUpdatedMessage(task, team)
            break

         case TaskAction.REMOVED:
            if (task.status === 'COMPLETED') {
               return
            }
            message = this.buildTaskRemovedMessage(task, team)
            break

         default:
            return
      }

      await this.sendNotification.execute({
         title: message.title,
         content: message.content,
         recipientId: assignedTo.userId.toString(),
      })
   }

   private buildAssignedMessage(task: Task, team: Team) {
      return {
         title: `You have been assigned a new task in ${team.name}`,
         content: `# ${task.title}\n## Priority: ${task.priority}\n${task.description}`,
      }
   }

   private buildDetailsUpdatedMessage(task: Task, team: Team) {
      return {
         title: `Your task in ${team.name} has had its details updated`,
         content: `# ${task.title}\n## Priority: ${task.priority}\n${task.description}`,
      }
   }

   private buildTaskRemovedMessage(task: Task, team: Team) {
      return {
         title: `Your task ${task.title} on ${team.name} has been removed`,
         content: `The task ${task.title} currently at ${task.status} has been permanently removed from the team`,
      }
   }
}

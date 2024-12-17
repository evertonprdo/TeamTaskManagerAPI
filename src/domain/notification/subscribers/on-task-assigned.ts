import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'

import { TeamsRepository } from '@/domain/management/repositories/teams.repository'
import { TeamMembersRepository } from '@/domain/management/repositories/team-members.repository'

import { SendNotificationUseCase } from '../use-cases/send-notification.use-case'
import { TaskAssignedEvent } from '@/domain/management/events/task-assigned.event'

export class OnTaskAssigned implements EventHandler {
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
         TaskAssignedEvent.name,
      )
   }

   private async sendNotificationToAssigned({ task }: TaskAssignedEvent) {
      const { assignedToId } = task

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

      await this.sendNotification.execute({
         title: `You have been assigned a new task in ${team.name}`,
         content: `# ${task.title}\n## Priority: ${task.priority}\n${task.description}`,
         recipientId: assignedTo.userId.toString(),
      })
   }
}

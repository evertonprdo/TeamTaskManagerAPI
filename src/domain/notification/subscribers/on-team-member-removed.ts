import { EventHandler } from '@/core/events/event-handler'
import { DomainEvents } from '@/core/events/domain-events'

import { UsersRepository } from '@management/repositories/users.repository'
import { TeamsRepository } from '@management/repositories/teams.repository'
import { TeamMemberRemovedEvent } from '@management/events/team-member-removed.event'

import { SendNotificationUseCase } from '../use-cases/send-notification.use-case'

export class OnTeamMemberRemoved implements EventHandler {
   constructor(
      private usersRepository: UsersRepository,
      private teamsRepository: TeamsRepository,
      private sendNotification: SendNotificationUseCase,
   ) {
      this.setupSubscriptions()
   }

   setupSubscriptions(): void {
      DomainEvents.register(
         this.sendNotificationToRemovedUser.bind(this),
         TeamMemberRemovedEvent.name,
      )
   }

   private async sendNotificationToRemovedUser({
      teamMember,
      removedBy,
      occurredAt,
   }: TeamMemberRemovedEvent) {
      const [team, removedByUser] = await Promise.all([
         this.teamsRepository.findById(teamMember.teamId.toString()),
         this.usersRepository.findById(removedBy.userId.toString()),
      ])

      const removedByRole = removedBy.constructor.name.toLowerCase()

      if (!team || !removedByUser) {
         return
      }

      await this.sendNotification.execute({
         recipientId: teamMember.userId.toString(),
         title: `Unfortunately, you have been removed from the ${team.name} team.`,
         content: `The ${removedByRole} ${
            removedByUser.name
         } has removed you from ${
            team.name
         } on ${occurredAt.toLocaleDateString()}`,
      })
   }
}

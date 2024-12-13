import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'

import { UsersRepository } from '@/domain/management/repositories/users.repository'
import { TeamsRepository } from '@/domain/management/repositories/teams.repository'

import { TeamMemberCreatedEvent } from '@/domain/management/events/team-member-created.event'
import { SendNotificationUseCase } from '../use-cases/send-notification.use-case'

export class OnTeamMemberCreated implements EventHandler {
   constructor(
      private sendNotification: SendNotificationUseCase,
      private usersRepository: UsersRepository,
      private teamsRepository: TeamsRepository,
   ) {
      this.setupSubscriptions()
   }

   setupSubscriptions(): void {
      DomainEvents.register(
         this.sendInvitationNotification.bind(this),
         TeamMemberCreatedEvent.name,
      )
   }

   private async sendInvitationNotification({
      createdBy,
      teamMember,
   }: TeamMemberCreatedEvent) {
      const [team, user] = await Promise.all([
         this.teamsRepository.findById(createdBy.teamId.toString()),
         this.usersRepository.findById(teamMember.userId.toString()),
      ])

      if (!team || !user) {
         return
      }

      await this.sendNotification.execute({
         recipientId: teamMember.id.toString(),
         title: `${user.name} Invited you to join ${team.name}'s team!`,
         content:
            `Congratulations! You've been invited to join ${team.name}'s team.` +
            "Don't miss the chance to be part of something amazing!",
      })
   }
}

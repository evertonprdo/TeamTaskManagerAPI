import { EventHandler } from '@/core/events/event-handler'

import { TeamMemberAcceptedInvitationEvent } from '@/domain/management/events/team-member-accepted-invitation.event'
import { TeamMembersRepository } from '@/domain/management/repositories/team-members.repository'
import { SendNotificationUseCase } from '../use-cases/send-notification.use-case'

export class OnTeamMemberAcceptsInvitation implements EventHandler {
   constructor(
      private teamMembersRepository: TeamMembersRepository,
      private sendNotification: SendNotificationUseCase,
   ) {
      this.setupSubscriptions()
   }

   setupSubscriptions(): void {
      throw new Error('Method not implemented.')
   }

   private async sendNotificationToTeamMembers({
      teamMember,
   }: TeamMemberAcceptedInvitationEvent) {
      const userIds =
         await this.teamMembersRepository.findManyUserIdsByTeamIdAndActive(
            teamMember.teamId.toString(),
         )

      for (const userId of userIds) {
      }
   }
}

import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'

import { TeamsRepository } from '@/domain/management/repositories/teams.repository'
import { TeamMembersRepository } from '@/domain/management/repositories/team-members.repository'
import { TeamMemberAcceptedInvitationEvent } from '@/domain/management/events/team-member-accepted-invitation.event'

import { SendManyNotificationsUseCase } from '../use-cases/send-many-notifications.use-case'

export class OnTeamMemberAcceptsInvitation implements EventHandler {
   constructor(
      private teamsRepository: TeamsRepository,
      private teamMembersRepository: TeamMembersRepository,
      private sendManyNotifications: SendManyNotificationsUseCase,
   ) {
      this.setupSubscriptions()
   }

   setupSubscriptions(): void {
      DomainEvents.register(
         this.sendNotificationToTeamMembers.bind(this),
         TeamMemberAcceptedInvitationEvent.name,
      )
   }

   private async sendNotificationToTeamMembers({
      teamMember,
   }: TeamMemberAcceptedInvitationEvent) {
      const [userIds, team, memberWithName] = await Promise.all([
         this.teamMembersRepository.findManyUserIdsByTeamIdAndActive(
            teamMember.teamId.toString(),
         ),
         this.teamsRepository.findById(teamMember.teamId.toString()),
         this.teamMembersRepository.findWithNameById(teamMember.id.toString()),
      ])

      if (!team || !memberWithName) {
         return
      }

      const teamMemberUserIdsWithoutNewMember = userIds.filter(
         (id) => id !== teamMember.userId.toString(),
      )

      await this.sendManyNotifications.execute({
         recipientIds: teamMemberUserIdsWithoutNewMember,
         title: `An new member has joined ${team.name} team`,
         content: `${
            memberWithName.name
         } just accepted the invitation to join his team as ${memberWithName.role.toLowerCase()}`,
      })
   }
}

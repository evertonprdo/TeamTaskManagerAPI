import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'

import { TeamsRepository } from '@management/repositories/teams.repository'
import { UsersRepository } from '@management/repositories/users.repository'
import { TeamMembersRepository } from '@management/repositories/team-members.repository'

import { Team } from '@management/entities/team'
import { User } from '@management/entities/user'

import { OwnershipPassedEvent } from '@management/events/ownership-passed.event'

import { SendNotificationUseCase } from '../use-cases/send-notification.use-case'
import { SendManyNotificationsUseCase } from '../use-cases/send-many-notifications.use-case'

interface OnOwnershipPassedConstructorProps {
   usersRepository: UsersRepository
   teamsRepository: TeamsRepository
   teamMembersRepository: TeamMembersRepository
   sendNotification: SendNotificationUseCase
   sendManyNotifications: SendManyNotificationsUseCase
}

export class OnOwnershipPassed implements EventHandler {
   private usersRepository: UsersRepository
   private teamsRepository: TeamsRepository
   private teamMembersRepository: TeamMembersRepository
   private sendNotification: SendNotificationUseCase
   private sendManyNotifications: SendManyNotificationsUseCase

   constructor({
      usersRepository,
      teamsRepository,
      sendNotification,
      teamMembersRepository,
      sendManyNotifications,
   }: OnOwnershipPassedConstructorProps) {
      this.usersRepository = usersRepository
      this.teamsRepository = teamsRepository
      this.teamMembersRepository = teamMembersRepository
      this.sendNotification = sendNotification
      this.sendManyNotifications = sendManyNotifications

      this.setupSubscriptions()
   }

   setupSubscriptions(): void {
      DomainEvents.register(this.handler.bind(this), OwnershipPassedEvent.name)
   }

   private async handler({ newOwner, oldOwner }: OwnershipPassedEvent) {
      const [team, newOwnerUser, userIds] = await Promise.all([
         this.teamsRepository.findById(newOwner.teamId.toString()),
         this.usersRepository.findById(newOwner.userId.toString()),
         this.teamMembersRepository.findManyUserIdsByTeamIdAndActive(
            newOwner.teamId.toString(),
         ),
      ])

      if (!team || !newOwnerUser) {
         return
      }

      const usersIdsWithoutOwners = userIds.filter(
         (userId) =>
            userId !== newOwner.userId.toString() &&
            userId !== oldOwner.userId.toString(),
      )

      await Promise.all([
         this.sendNotificationToNewOwner(team, newOwner.userId.toString()),
         this.sendNotificationToTeamMembers(
            team,
            newOwnerUser,
            usersIdsWithoutOwners,
         ),
      ])
   }

   private async sendNotificationToNewOwner(team: Team, recipientId: string) {
      await this.sendNotification.execute({
         recipientId,
         title: `Congratulations, you are the new owner of ${team.name}`,
         content:
            'Now you have full management control of the team and team members',
      })
   }

   private async sendNotificationToTeamMembers(
      team: Team,
      newOwnerUser: User,
      recipientIds: string[],
   ) {
      await this.sendManyNotifications.execute({
         recipientIds: recipientIds,
         title: `Your team ${team.name} has a new owner`,
         content: `Ownership has been passed to ${newOwnerUser.name}`,
      })
   }
}

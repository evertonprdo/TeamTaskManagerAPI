import { EventHandler } from '@/core/events/event-handler'
import { DomainEvents } from '@/core/events/domain-events'

import { TeamRemovedEvent } from '@/domain/management/events/team-removed.event'

import { SendManyNotificationsUseCase } from '../use-cases/send-many-notifications.use-case'

export class OnTeamRemoved implements EventHandler {
   constructor(private sendManyNotifications: SendManyNotificationsUseCase) {
      this.setupSubscriptions()
   }

   setupSubscriptions(): void {
      DomainEvents.register(
         this.sendNotificationToMembers.bind(this),
         TeamRemovedEvent.name,
      )
   }

   private sendNotificationToMembers({ team, userIds }: TeamRemovedEvent) {
      this.sendManyNotifications.execute({
         userIds,
         title: `Unfortunately the team ${team.name} has been deleted`,
         content:
            'All tasks and team members have been removed along with the team.',
      })
   }
}

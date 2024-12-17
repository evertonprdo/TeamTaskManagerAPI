import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Notification, NotificationProps } from '../../entities/notification'

export function makeNotification(
   overwrite: Partial<NotificationProps> = {},
   id?: UniqueEntityID,
) {
   const notification = Notification.create(
      {
         recipientId: new UniqueEntityID(),
         messageId: new UniqueEntityID(),
         ...overwrite,
      },
      id,
   )

   return notification
}

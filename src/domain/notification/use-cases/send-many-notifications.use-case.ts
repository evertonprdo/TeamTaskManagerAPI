import { Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Message } from '../entities/message'
import { Notification } from '../entities/notification'

import { NotificationsRepository } from '../repositories/notifications.repository'

interface SendManyNotificationsRequest {
   userIds: string[]
   title: string
   content: string
}

type SendManyNotificationsResponse = Either<
   null,
   { message: Message; notifications: Notification[] }
>

export class SendManyNotifications {
   constructor(private notificationsRepository: NotificationsRepository) {}

   async execute({
      userIds,
      content,
      title,
   }: SendManyNotificationsRequest): Promise<SendManyNotificationsResponse> {
      const message = Message.create({
         title,
         content,
      })

      await this.notificationsRepository.createMessage(message)

      const notifications = userIds.map((userId) =>
         Notification.create({
            messageId: message.id,
            recipientId: new UniqueEntityID(userId),
         }),
      )

      await this.notificationsRepository.createMany(notifications)

      return right({ message, notifications })
   }
}

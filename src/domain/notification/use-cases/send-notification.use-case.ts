import { Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Message } from '../entities/message'
import { Notification } from '../entities/notification'

import { NotificationsRepository } from '../repositories/notifications.repository'

export interface SendNotificationUseCaseRequest {
   recipientId: string
   title: string
   content: string
}

export type SendNotificationUseCaseResponse = Either<
   null,
   { notification: Notification; message: Message }
>

export class SendNotificationUseCase {
   constructor(private notificationsRepository: NotificationsRepository) {}

   async execute({
      title,
      content,
      recipientId,
   }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
      const message = Message.create({
         title,
         content,
      })

      await this.notificationsRepository.createMessage(message)

      const notification = Notification.create({
         recipientId: new UniqueEntityID(recipientId),
         messageId: message.id,
      })

      await this.notificationsRepository.create(notification)

      return right({
         notification,
         message,
      })
   }
}

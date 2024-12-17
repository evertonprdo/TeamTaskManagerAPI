import { Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Message } from '../entities/message'
import { Notification } from '../entities/notification'

import { NotificationsRepository } from '../repositories/notifications.repository'

export interface SendManyNotificationsUseCaseRequest {
   userIds: string[]
   title: string
   content: string
}

export type SendManyNotificationsUseCaseResponse = Either<
   null,
   { message: Message; notifications: Notification[] }
>

export class SendManyNotificationsUseCase {
   constructor(private notificationsRepository: NotificationsRepository) {}

   async execute({
      userIds,
      content,
      title,
   }: SendManyNotificationsUseCaseRequest): Promise<SendManyNotificationsUseCaseResponse> {
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

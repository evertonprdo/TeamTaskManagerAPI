import { Either, left, right } from '@/core/either'

import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Notification } from '../entities/notification'
import { NotificationsRepository } from '../repositories/notifications.repository'

interface ReadNotificationUseCaseRequest {
   recipientId: string
   notificationId: string
}

type ReadNotificationUseCaseResponse = Either<
   ResourceNotFoundError,
   { notification: Notification }
>

export class ReadNotificationUseCase {
   constructor(private notificationsRepository: NotificationsRepository) {}

   async execute({
      notificationId,
      recipientId,
   }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
      const notification = await this.notificationsRepository.findById(
         notificationId,
      )

      if (!notification) {
         return left(new ResourceNotFoundError())
      }

      if (recipientId !== notification.recipientId.toString()) {
         return left(new NotAllowedError())
      }

      notification.read()
      await this.notificationsRepository.save(notification)

      return right({ notification })
   }
}

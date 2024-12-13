import { Either, right } from '@/core/either'

import { NotificationWithMessage } from '../entities/value-objects/notification-with-message'
import { NotificationsRepository } from '../repositories/notifications.repository'

interface FetchNotificationsUseCaseRequest {
   recipientId: string
   page: number
   unreadOnly: boolean
}

type FetchNotificationsUseCaseResponse = Either<
   null,
   { notifications: NotificationWithMessage[] }
>

export class FetchNotificationsUseCase {
   constructor(private notificationsRepository: NotificationsRepository) {}

   async execute({
      page,
      unreadOnly,
      recipientId,
   }: FetchNotificationsUseCaseRequest): Promise<FetchNotificationsUseCaseResponse> {
      const notifications =
         await this.notificationsRepository.findManyByRecipientId({
            recipientId,
            page,
            unreadOnly,
         })

      return right({ notifications })
   }
}

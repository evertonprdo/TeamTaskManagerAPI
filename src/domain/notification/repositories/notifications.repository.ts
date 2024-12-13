import { PaginationParams } from '@/core/repositories/pagination-params'

import { Message } from '../entities/message'
import { Notification } from '../entities/notification'
import { NotificationWithMessage } from '../entities/value-objects/notification-with-message'

export type FindManyByRecipientIdParams = {
   recipientId: string
   unreadOnly?: boolean
} & PaginationParams

export interface NotificationsRepository {
   findManyByRecipientId(
      params: FindManyByRecipientIdParams,
   ): Promise<NotificationWithMessage[]>

   findById(id: string): Promise<Notification | null>

   createMessage(message: Message): Promise<void>
   createMany(notifications: Notification[]): Promise<void>

   create(notification: Notification): Promise<void>
   save(notification: Notification): Promise<void>
}

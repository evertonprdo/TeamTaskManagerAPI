import { Message } from '../../entities/message'
import { Notification } from '../../entities/notification'
import { NotificationWithMessage } from '../../entities/value-objects/notification-with-message'
import {
   FindManyByRecipientIdParams,
   NotificationsRepository,
} from '../../repositories/notifications.repository'

export class InMemoryNotificationsRepository
   implements NotificationsRepository
{
   public messages: Message[] = []
   public notifications: Notification[] = []

   async findManyByRecipientId({
      page,
      unreadOnly,
      recipientId,
   }: FindManyByRecipientIdParams) {
      let notifications = this.notifications.filter(
         (item) => item.recipientId.toString() === recipientId,
      )

      if (unreadOnly) {
         notifications = notifications.filter((item) => !item.readAt)
      }

      notifications = notifications.slice((page - 1) * 20, page * 20)

      const notificationWithMessage = notifications.map((notification) => {
         const message = this.messages.find((item) =>
            item.id.equals(notification.messageId),
         )

         if (!message) {
            throw new Error()
         }

         return NotificationWithMessage.create({
            recipientId: notification.recipientId,
            messageId: message.id,
            title: message.title,
            content: message.content,
            createdAt: message.createdAt,
            readAt: notification.readAt,
         })
      })

      return notificationWithMessage
   }

   async findById(id: string): Promise<Notification | null> {
      const notification = this.notifications.find(
         (item) => item.id.toString() === id,
      )

      if (!notification) {
         return null
      }

      return notification
   }

   async createMessage(message: Message): Promise<void> {
      this.messages.push(message)
   }

   async createMany(notifications: Notification[]): Promise<void> {
      this.notifications.push(...notifications)
   }

   async create(notification: Notification): Promise<void> {
      this.notifications.push(notification)
   }

   async save(notification: Notification): Promise<void> {
      const notificationIndex = this.notifications.findIndex((item) =>
         item.id.equals(notification.id),
      )

      this.notifications[notificationIndex] = notification
   }
}

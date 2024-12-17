import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeNotification } from '../_tests/factories/make-notification'
import { InMemoryNotificationsRepository } from '../_tests/repositories/in-memory-notifications.repository'

import { ReadNotificationUseCase } from './read-notification.use-case'
import { NotAllowedError } from '@/core/errors/not-allowed.error'

let notificationsRepository: InMemoryNotificationsRepository

let sut: ReadNotificationUseCase

describe('Use case: Read notification', () => {
   beforeEach(() => {
      notificationsRepository = new InMemoryNotificationsRepository()

      sut = new ReadNotificationUseCase(notificationsRepository)
   })

   it('should mark a notification as read', async () => {
      const notification = makeNotification()
      notificationsRepository.notifications.push(notification)

      const result = await sut.execute({
         notificationId: notification.id.toString(),
         recipientId: notification.recipientId.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(notificationsRepository.notifications[0]).toEqual(
         result.value.notification,
      )
      expect(result.value.notification.readAt).toEqual(expect.any(Date))
   })

   it('should not be able to read a notification from another user', async () => {
      const notification = makeNotification({
         recipientId: new UniqueEntityID('recipient-1'),
      })

      notificationsRepository.notifications.push(notification)

      const result = await sut.execute({
         recipientId: 'recipient-2',
         notificationId: notification.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })
})

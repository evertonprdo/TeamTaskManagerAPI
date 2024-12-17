import { makeMessage } from '../_tests/factories/make-message'
import { makeNotification } from '../_tests/factories/make-notification'
import { InMemoryNotificationsRepository } from '../_tests/repositories/in-memory-notifications.repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FetchNotificationsUseCase } from './fetch-notifications.use-case'

let notificationsRepository: InMemoryNotificationsRepository
let sut: FetchNotificationsUseCase

describe('Use case: Fetch notifications', () => {
   beforeEach(() => {
      notificationsRepository = new InMemoryNotificationsRepository()
      sut = new FetchNotificationsUseCase(notificationsRepository)
   })

   it('should list user notifications', async () => {
      const userId = new UniqueEntityID()

      const messages = Array.from({ length: 3 }, () => makeMessage())
      notificationsRepository.messages.push(...messages)

      const notifications = messages.map((item) =>
         makeNotification({ recipientId: userId, messageId: item.id }),
      )
      notificationsRepository.notifications.push(...notifications)

      const result = await sut.execute({
         page: 1,
         unreadOnly: false,
         recipientId: userId.toString(),
      })

      expect(result.isRight()).toBe(true)
      expect(result.value?.notifications).toHaveLength(3)

      expect(result.value?.notifications).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               messageId: messages[0].id,
               recipientId: userId,
            }),
         ]),
      )
   })

   it('should list only unread user notifications', async () => {
      const userId = new UniqueEntityID()

      const messages = Array.from({ length: 5 }, () => makeMessage())
      notificationsRepository.messages.push(...messages)

      const notifications = messages.map((item) =>
         makeNotification({ recipientId: userId, messageId: item.id }),
      )

      const notificationsRead = messages.map((item) =>
         makeNotification({
            recipientId: userId,
            messageId: item.id,
            readAt: new Date(),
         }),
      )
      notificationsRepository.notifications.push(
         ...notifications,
         ...notificationsRead,
      )

      const result = await sut.execute({
         page: 1,
         unreadOnly: true,
         recipientId: userId.toString(),
      })

      expect(result.isRight()).toBe(true)
      expect(result.value?.notifications).toHaveLength(5)
   })

   it('should list user notifications paginated', async () => {
      const userId = new UniqueEntityID()

      const messages = Array.from({ length: 23 }, () => makeMessage())
      notificationsRepository.messages.push(...messages)

      const notifications = messages.map((item) =>
         makeNotification({ recipientId: userId, messageId: item.id }),
      )
      notificationsRepository.notifications.push(...notifications)

      const result = await sut.execute({
         page: 2,
         unreadOnly: false,
         recipientId: userId.toString(),
      })

      expect(result.isRight()).toBe(true)
      expect(result.value?.notifications).toHaveLength(3)
   })
})

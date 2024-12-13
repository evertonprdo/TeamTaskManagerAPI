import { InMemoryNotificationsRepository } from '../tests/repositories/in-memory-notifications.repository'

import { SendNotificationUseCase } from './send-notification.use-case'

let notificationsRepository: InMemoryNotificationsRepository

let sut: SendNotificationUseCase

describe('Use case: Send notification', () => {
   beforeEach(() => {
      notificationsRepository = new InMemoryNotificationsRepository()

      sut = new SendNotificationUseCase(notificationsRepository)
   })

   it('should send a notification', async () => {
      const result = await sut.execute({
         title: 'title',
         content: 'content',
         recipientId: 'any-uuid',
      })

      expect(result.isRight()).toBe(true)

      expect(result.value?.message).toEqual(notificationsRepository.messages[0])
      expect(result.value?.notification).toEqual(
         notificationsRepository.notifications[0],
      )
   })
})

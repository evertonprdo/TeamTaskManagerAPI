import { InMemoryNotificationsRepository } from '../_tests/repositories/in-memory-notifications.repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { SendManyNotificationsUseCase } from './send-many-notifications.use-case'

let notificationsRepository: InMemoryNotificationsRepository

let sut: SendManyNotificationsUseCase

describe('Use case: Send Team MembersNotification', () => {
   beforeEach(() => {
      notificationsRepository = new InMemoryNotificationsRepository()

      sut = new SendManyNotificationsUseCase(notificationsRepository)
   })

   it('should send the same message to all users', async () => {
      const userIds = Array.from({ length: 3 }, () =>
         new UniqueEntityID().toString(),
      )

      const result = await sut.execute({
         recipientIds: userIds,
         title: 'title',
         content: 'content',
      })

      expect(result.isRight()).toBe(true)

      expect(notificationsRepository.messages).toHaveLength(1)
      expect(result.value?.message).toEqual(notificationsRepository.messages[0])

      expect(notificationsRepository.notifications).toHaveLength(3)
      expect(result.value?.notifications).toEqual(
         notificationsRepository.notifications,
      )
   })
})

import { makeUser } from '../tests/factories/make-user'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { AnonymizeUserUseCase } from './anonymize-user.use-case'

let usersRepository: InMemoryUsersRepository
let sut: AnonymizeUserUseCase

describe('Use case: Anonymize user', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      sut = new AnonymizeUserUseCase(usersRepository)
   })

   it('should anonymize a user', async () => {
      const user = makeUser({ name: 'John Doe' })
      usersRepository.items.push(user)

      const result = await sut.execute({ userId: user.id.toString() })

      expect(result.isRight()).toBe(true)
      expect(result.value).toEqual({
         user: expect.objectContaining({
            name: 'Member J.',
         }),
      })
   })

   it('should not be possible to anonymize a user that does not exist', async () => {
      const result = await sut.execute({ userId: 'any-uuid' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

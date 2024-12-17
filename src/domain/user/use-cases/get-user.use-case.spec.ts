import { makeUser } from '../_tests/factories/make-user'
import { InMemoryUsersRepository } from '../_tests/repositories/in-memory-users.repository'

import { GetUserUseCase } from './get-user.use-case'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

let usersRepository: InMemoryUsersRepository

let sut: GetUserUseCase

describe('Use case: Get user', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      sut = new GetUserUseCase(usersRepository)
   })

   it('should get a user', async () => {
      const user = makeUser()
      usersRepository.items.push(user)

      const result = await sut.execute({ userId: user.id.toString() })

      expect(result.isRight()).toBe(true)
      expect(result.value).toEqual({
         user: expect.objectContaining({
            ...user,
         }),
      })
   })

   it('should result in a resource not found error', async () => {
      const result = await sut.execute({ userId: 'any-user' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

import { makeUser } from '../tests/factories/make-user'
import { FakeHasher } from '../tests/cryptography/fake-hasher'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { UpdateUserUseCase } from './update-user.use-case'

let fakeHasher: FakeHasher
let usersRepository: InMemoryUsersRepository

let sut: UpdateUserUseCase

describe('Use case: Update user', () => {
   beforeEach(() => {
      fakeHasher = new FakeHasher()
      usersRepository = new InMemoryUsersRepository()

      sut = new UpdateUserUseCase(usersRepository, fakeHasher)
   })

   it('should update a user', async () => {
      const user = makeUser({
         name: 'Old name',
         email: 'old@email.com',
         password: 'old-password',
      })
      usersRepository.items.push(user)

      const newUserProps = {
         name: 'New name',
         email: 'new@email.com',
         password: 'new-password',
      }

      const result = await sut.execute({
         userId: user.id.toString(),
         ...newUserProps,
      })

      expect(result.isRight()).toBe(true)

      const hashedPassword = await fakeHasher.hash(newUserProps.password)

      expect(result.value).toEqual({
         user: expect.objectContaining({
            id: user.id,
            ...newUserProps,
            password: hashedPassword,
         }),
      })
   })

   it('should not be possible to update a user that does not exist', async () => {
      const result = await sut.execute({
         userId: 'any-uuid',
         name: 'any-name',
         email: 'any@email.com',
         password: 'any-password',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
   })
})

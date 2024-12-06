import { makeUser } from '../tests/factories/make-user'

import { FakeHasher } from '../tests/cryptography/fake-hasher'
import { FakeEncrypter } from '../tests/cryptography/fake-encrypter'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'

import { WrongCredentialsError } from './errors/wrong-credentials.error'

import { AuthenticateUseCase } from './authenticate.use-case'

let fakeEncrypter: FakeEncrypter
let fakeHasher: FakeHasher
let usersRepository: InMemoryUsersRepository

let sut: AuthenticateUseCase

describe('Use case: Authenticate', () => {
   beforeEach(() => {
      fakeEncrypter = new FakeEncrypter()
      fakeHasher = new FakeHasher()
      usersRepository = new InMemoryUsersRepository()

      sut = new AuthenticateUseCase(usersRepository, fakeHasher, fakeEncrypter)
   })

   it('should authenticate a user', async () => {
      const user = makeUser({
         email: 'auth@email.com',
         password: await fakeHasher.hash('auth-password'),
      })
      usersRepository.items.push(user)

      const result = await sut.execute({
         email: 'auth@email.com',
         password: 'auth-password',
      })

      expect(result.isRight()).toBe(true)
      expect(result.value).toEqual({
         accessToken: expect.any(String),
      })
   })

   it('should not be possible to authenticate a user with wrong credentials', async () => {
      const user = makeUser({
         email: 'auth@email.com',
         password: await fakeHasher.hash('right-password'),
      })
      usersRepository.items.push(user)

      const result = await sut.execute({
         email: 'auth@email.com',
         password: 'wrong-password',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(WrongCredentialsError)
   })

   it('should not be possible to authenticate a user that does not exist', async () => {
      const result = await sut.execute({
         email: 'any@email.com',
         password: 'any-password',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(WrongCredentialsError)
   })
})

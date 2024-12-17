import { FakeHasher } from '../_tests/cryptography/fake-hasher'
import { InMemoryUsersRepository } from '../_tests/repositories/in-memory-users.repository'

import { UserAlreadyExistsError } from './errors/user-already-exists.error'

import { RegisterUserUseCase } from './register-user.use-case'

let fakeHasher: FakeHasher
let usersRepository: InMemoryUsersRepository

let sut: RegisterUserUseCase

describe('Use case: Create user', () => {
   beforeEach(() => {
      fakeHasher = new FakeHasher()
      usersRepository = new InMemoryUsersRepository()

      sut = new RegisterUserUseCase(usersRepository, fakeHasher)
   })

   it('should register a user', async () => {
      const userProps = {
         name: 'John Doe',
         email: 'test@email.com',
         password: '123456',
      }

      const result = await sut.execute(userProps)

      expect(result.isRight()).toBe(true)

      const hashedPassword = await fakeHasher.hash(userProps.password)

      expect(result.value).toEqual({
         user: expect.objectContaining({
            name: 'John Doe',
            email: 'test@email.com',
            password: hashedPassword,
         }),
      })
   })

   it('should not be able to register with same email twice', async () => {
      await sut.execute({
         name: 'John Doe',
         email: 'same@email.com',
         password: '123456',
      })

      const result = await sut.execute({
         name: 'Another user',
         email: 'same@email.com',
         password: '123456',
      })

      expect(result.isLeft())
      expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
   })
})

import { Either, left, right } from '@/core/either'

import { WrongCredentialsError } from './errors/wrong-credentials.error'

import { HashCompare } from '../cryptography/hash-compare'
import { Encrypter } from '../cryptography/encrypter'
import { UsersRepository } from '../repositories/users.repository'

interface AuthenticateUseCaseRequest {
   email: string
   password: string
}

type AuthenticateUseCaseResponse = Either<
   WrongCredentialsError,
   { accessToken: string }
>

export class AuthenticateUseCase {
   constructor(
      private usersRepository: UsersRepository,
      private hashCompare: HashCompare,
      private encrypter: Encrypter,
   ) {}

   async execute({
      email,
      password,
   }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
      const user = await this.usersRepository.findByEmail(email)

      if (!user) {
         return left(new WrongCredentialsError())
      }

      const isPasswordValid = await this.hashCompare.compare(
         password,
         user.password,
      )

      if (!isPasswordValid) {
         return left(new WrongCredentialsError())
      }

      const accessToken = await this.encrypter.encrypt({
         sub: user.id.toString(),
      })

      return right({ accessToken })
   }
}

import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { UserAlreadyExistsError } from './errors/user-already-exists.error'

import { HashGenerator } from '../cryptography/hash-generator'
import { UsersRepository } from '../repositories/users.repository'

import { User } from '../entities/user'

interface RegisterUserUseCaseRequest {
   name: string
   email: string
   password: string
}

type RegisterUserUseCaseResponse = Either<
   UserAlreadyExistsError,
   { user: User }
>

@Injectable()
export class RegisterUserUseCase {
   constructor(
      private usersRepository: UsersRepository,
      private hashGenerator: HashGenerator,
   ) {}

   async execute({
      name,
      email,
      password,
   }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
      const userWithSameEmail = await this.usersRepository.findByEmail(email)

      if (userWithSameEmail) {
         return left(new UserAlreadyExistsError())
      }

      const hashedPassword = await this.hashGenerator.hash(password)

      const user = User.create({
         name,
         email,
         password: hashedPassword,
      })

      await this.usersRepository.create(user)

      return right({ user })
   }
}

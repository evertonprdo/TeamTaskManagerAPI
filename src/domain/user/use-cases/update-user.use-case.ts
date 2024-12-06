import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { User } from '../entities/user'
import { HashGenerator } from '../cryptography/hash-generator'
import { UsersRepository } from '../repositories/users.repository'

interface UpdateUserUseCaseRequest {
   userId: string
   name: string
   email: string
   password: string
}

type UpdateUserUseCaseResponse = Either<ResourceNotFoundError, { user: User }>

export class UpdateUserUseCase {
   constructor(
      private usersRepository: UsersRepository,
      private hashGenerator: HashGenerator,
   ) {}

   async execute({
      userId,
      name,
      email,
      password,
   }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
      const user = await this.usersRepository.findById(userId)

      if (!user) {
         return left(new ResourceNotFoundError())
      }

      user.name = name
      user.email = email
      user.password = await this.hashGenerator.hash(password)

      return right({ user })
   }
}

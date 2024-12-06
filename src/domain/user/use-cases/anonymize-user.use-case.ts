import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { User } from '../entities/user'
import { UsersRepository } from '../repositories/users.repository'

interface AnonymizeUserUseCaseRequest {
   userId: string
}

type AnonymizeUserUseCaseResponse = Either<
   ResourceNotFoundError,
   { user: User }
>

export class AnonymizeUserUseCase {
   constructor(private usersRepository: UsersRepository) {}

   async execute({
      userId,
   }: AnonymizeUserUseCaseRequest): Promise<AnonymizeUserUseCaseResponse> {
      const user = await this.usersRepository.findById(userId)

      if (!user) {
         return left(new ResourceNotFoundError())
      }

      user.name = `Member ${user.name[0].toUpperCase()}.`

      await this.usersRepository.save(user)

      return right({ user })
   }
}

import { UseCaseError } from '@/core/errors/use-case.error'

export class UserEmailNotFoundError extends Error implements UseCaseError {
   constructor(email: string) {
      super(`A user with email "${email}" does not exist`)
   }
}

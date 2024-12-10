import { UseCaseError } from '@/core/errors/use-case.error'

export class UserAlreadyInError extends Error implements UseCaseError {
   constructor() {
      super('User is already on this team')
   }
}

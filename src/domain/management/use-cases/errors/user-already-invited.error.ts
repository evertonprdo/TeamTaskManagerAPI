import { UseCaseError } from '@/core/errors/use-case.error'

export class UserAlreadyInvitedError extends Error implements UseCaseError {
   constructor() {
      super('User has already been invited to this team')
   }
}

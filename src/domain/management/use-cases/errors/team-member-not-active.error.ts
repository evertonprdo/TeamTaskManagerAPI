import { UseCaseError } from '@/core/errors/use-case.error'

export class TeamMemberNotActiveError extends Error implements UseCaseError {
   constructor() {
      super('The requested team member is not active')
   }
}

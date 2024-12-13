import { UseCaseError } from '@/core/errors/use-case.error'

export class NotMemberAssignedError extends Error implements UseCaseError {
   constructor() {
      super(
         'Only Admins, Owner or member who are assigned to can perform this action, ',
      )
   }
}

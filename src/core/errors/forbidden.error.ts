import { UseCaseError } from '@/core/errors/use-case.error'

export class ForbiddenError extends Error implements UseCaseError {
   constructor() {
      super('Forbidden operation')
   }
}

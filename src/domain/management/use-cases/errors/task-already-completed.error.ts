import { UseCaseError } from '@/core/errors/use-case.error'

export class TaskAlreadyCompletedError extends Error implements UseCaseError {
   constructor() {
      super('This task is already completed')
   }
}

import { UseCaseError } from '@/core/errors/use-case.error'

export class TaskAlreadyInProgressError extends Error implements UseCaseError {
   constructor() {
      super('This task is already in progress')
   }
}

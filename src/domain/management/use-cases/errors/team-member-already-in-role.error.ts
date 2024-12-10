import { UseCaseError } from '@/core/errors/use-case.error'

export class TeamMemberAlreadyInRoleError
   extends Error
   implements UseCaseError
{
   constructor(role: string) {
      super(`The team member is already in this role: ${role}`)
   }
}

import { Either, left, right } from '@/core/either'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Member } from '../entities/member'
import { TeamMember } from '../entities/team-member'

import { TeamMembersRepository } from '../repositories/team-members.repository'

interface RemoveTeamMemberUseCaseRequest {
   teamMember: Admin | Member
   removingBy: TeamMember
}

type RemoveTeamMemberUseCaseResponse = Either<
   ResourceNotFoundError | NotAllowedError | ForbiddenError,
   { teamMember: TeamMember }
>

export class RemoveTeamMemberUseCase {
   private allowedRoles = {
      ADMIN: [Owner],
      MEMBER: [Owner, Admin],
   }

   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      teamMember,
      removingBy,
   }: RemoveTeamMemberUseCaseRequest): Promise<RemoveTeamMemberUseCaseResponse> {
      if (teamMember instanceof Owner) {
         return left(new ForbiddenError())
      }

      const removedRole = teamMember.constructor.name.toUpperCase() as
         | 'ADMIN'
         | 'MEMBER'

      const isSelfQuit = teamMember.id.equals(removingBy.id)

      const isAllowedToRemove = this.allowedRoles[removedRole].some(
         (role) => removingBy instanceof role,
      )

      if (!isSelfQuit && !isAllowedToRemove) {
         return left(new NotAllowedError())
      }

      teamMember.remove(removingBy)
      await this.teamMembersRepository.save(teamMember)

      return right({ teamMember })
   }
}

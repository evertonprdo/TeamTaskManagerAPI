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
   teamMemberId: string
   removingBy: TeamMember
}

type RemoveTeamMemberUseCaseResponse = Either<
   ResourceNotFoundError | NotAllowedError | ForbiddenError,
   { teamMember: TeamMember }
>

export class RemoveTeamMemberUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      teamMemberId,
      removingBy,
   }: RemoveTeamMemberUseCaseRequest): Promise<RemoveTeamMemberUseCaseResponse> {
      const teamMember = await this.teamMembersRepository.findById(teamMemberId)

      if (!teamMember) {
         return left(new ResourceNotFoundError())
      }

      const removeError = this.getRemoveError(teamMember, removingBy)
      if (removeError) {
         return left(removeError)
      }

      teamMember.remove(removingBy)
      await this.teamMembersRepository.save(teamMember)

      return right({ teamMember })
   }

   private getRemoveError(teamMember: TeamMember, removingBy: TeamMember) {
      const isQuitting = teamMember.id.equals(removingBy.id)

      switch (teamMember.constructor) {
         case Owner:
            return new ForbiddenError()

         case Admin:
            if (isQuitting) {
               break
            }
            if (removingBy instanceof Owner) {
               break
            }

            return new NotAllowedError()

         case Member:
            if (isQuitting) {
               break
            }
            if (removingBy instanceof Admin || removingBy instanceof Owner) {
               break
            }

            return new NotAllowedError()

         default:
            throw new Error()
      }
   }
}

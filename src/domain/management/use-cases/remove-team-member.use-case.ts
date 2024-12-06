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
   ResourceNotFoundError | NotAllowedError,
   { teamMember: TeamMember }
>

export class RemoveTeamMemberUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      teamMemberId,
      removingBy,
   }: RemoveTeamMemberUseCaseRequest): Promise<RemoveTeamMemberUseCaseResponse> {
      const teamMember = (await this.teamMembersRepository.findById(
         teamMemberId,
      )) as Admin | Member

      if (!teamMember) {
         return left(new ResourceNotFoundError())
      }

      if (!teamMember.teamId.equals(removingBy.teamId)) {
         return left(new NotAllowedError())
      }

      switch (teamMember.constructor) {
         case Owner:
            return left(new ForbiddenError())

         case Admin:
            if (teamMember.id.equals(removingBy.id)) {
               break
            }

            if (removingBy instanceof Owner) {
               break
            }

            return left(new NotAllowedError())

         case Member:
            if (teamMember.id.equals(removingBy.id)) {
               break
            }

            const isAllowedToRemove =
               removingBy instanceof Admin || removingBy instanceof Owner

            if (isAllowedToRemove) {
               break
            }

            return left(new NotAllowedError())

         default:
            throw new Error()
      }

      teamMember.remove(removingBy)
      await this.teamMembersRepository.save(teamMember)

      return right({ teamMember })
   }
}

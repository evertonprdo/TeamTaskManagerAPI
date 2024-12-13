import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TeamMember } from '../../entities/team-member'
import { TeamMembersRepository } from '../../repositories/team-members.repository'
import { TeamMemberNotActiveError } from '../errors/team-member-not-active.error'

interface GetTeamMemberUseCaseRequest {
   teamMemberId: string
   isActive?: boolean
}

type GetTeamMemberUseCaseResponse = Either<
   ResourceNotFoundError,
   { teamMember: TeamMember }
>

export class GetTeamMemberUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      teamMemberId,
      isActive,
   }: GetTeamMemberUseCaseRequest): Promise<GetTeamMemberUseCaseResponse> {
      const teamMember = await this.teamMembersRepository.findById(teamMemberId)

      if (!teamMember) {
         return left(new ResourceNotFoundError())
      }

      if (isActive && teamMember.status !== 'ACTIVE') {
         return left(new TeamMemberNotActiveError())
      }

      return right({ teamMember })
   }
}

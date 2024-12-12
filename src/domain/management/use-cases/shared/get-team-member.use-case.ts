import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TeamMember } from '../../entities/team-member'
import { TeamMembersRepository } from '../../repositories/team-members.repository'

interface GetTeamMemberUseCaseRequest {
   teamMemberId: string
}

type GetTeamMemberUseCaseResponse = Either<
   ResourceNotFoundError,
   { teamMember: TeamMember }
>

export class GetTeamMemberUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      teamMemberId,
   }: GetTeamMemberUseCaseRequest): Promise<GetTeamMemberUseCaseResponse> {
      const teamMember = await this.teamMembersRepository.findById(teamMemberId)

      if (!teamMember) {
         return left(new ResourceNotFoundError())
      }

      return right({ teamMember })
   }
}

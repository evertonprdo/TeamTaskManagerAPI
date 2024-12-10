import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TeamMembersRepository } from '../repositories/team-members.repository'
import { TeamMemberDetails } from '../entities/value-objects/team-member-details'

interface GetTeamMemberDetailsUseCaseRequest {
   teamMemberId: string
}

type GetTeamMemberDetailsUseCaseResponse = Either<
   ResourceNotFoundError,
   { teamMemberDetails: TeamMemberDetails }
>

export class GetTeamMemberDetailsUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      teamMemberId,
   }: GetTeamMemberDetailsUseCaseRequest): Promise<GetTeamMemberDetailsUseCaseResponse> {
      const teamMemberDetails =
         await this.teamMembersRepository.findDetailsById(teamMemberId)

      if (!teamMemberDetails) {
         return left(new ResourceNotFoundError())
      }

      return right({ teamMemberDetails })
   }
}

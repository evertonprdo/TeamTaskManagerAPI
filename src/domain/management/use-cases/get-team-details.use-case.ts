import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TeamDetails } from '../entities/value-objects/team-details'
import { TeamsRepository } from '../repositories/teams.repository'

interface GetTeamDetailsUseCaseRequest {
   teamId: string
}

type GetTeamDetailsUseCaseResponse = Either<
   ResourceNotFoundError,
   { teamDetails: TeamDetails }
>

export class GetTeamDetailsUseCase {
   constructor(private teamsRepository: TeamsRepository) {}

   async execute({
      teamId,
   }: GetTeamDetailsUseCaseRequest): Promise<GetTeamDetailsUseCaseResponse> {
      const teamDetails = await this.teamsRepository.findDetailsById(teamId)

      if (!teamDetails) {
         return left(new ResourceNotFoundError())
      }

      return right({ teamDetails })
   }
}

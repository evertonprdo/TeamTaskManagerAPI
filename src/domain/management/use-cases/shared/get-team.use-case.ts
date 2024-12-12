import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Team } from '../../entities/team'
import { TeamsRepository } from '../../repositories/teams.repository'

interface GetTeamUseCaseRequest {
   teamId: string
}

type GetTeamUseCaseResponse = Either<ResourceNotFoundError, { team: Team }>

export class GetTeamUseCase {
   constructor(private teamsRepository: TeamsRepository) {}

   async execute({
      teamId,
   }: GetTeamUseCaseRequest): Promise<GetTeamUseCaseResponse> {
      const team = await this.teamsRepository.findById(teamId)

      if (!team) {
         return left(new ResourceNotFoundError())
      }

      return right({ team })
   }
}

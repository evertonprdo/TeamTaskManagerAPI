import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TeamsRepository } from '../repositories/teams.repository'
import { Team } from '../entities/team'

interface UpdateTeamUseCaseRequest {
   teamId: string
   name: string
   description: string
}

type UpdateTeamUseCaseResponse = Either<ResourceNotFoundError, { team: Team }>

export class UpdateTeamUseCase {
   constructor(private teamsRepository: TeamsRepository) {}

   async execute({
      teamId,
      name,
      description,
   }: UpdateTeamUseCaseRequest): Promise<UpdateTeamUseCaseResponse> {
      const team = await this.teamsRepository.findById(teamId)

      if (!team) {
         return left(new ResourceNotFoundError())
      }

      team.name = name
      team.description = description

      return right({ team })
   }
}

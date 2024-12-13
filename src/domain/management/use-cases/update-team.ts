import { Either, right } from '@/core/either'

import { Team } from '../entities/team'
import { TeamsRepository } from '../repositories/teams.repository'

interface UpdateTeamUseCaseRequest {
   team: Team
   name: string
   description: string
}

type UpdateTeamUseCaseResponse = Either<null, { team: Team }>

export class UpdateTeamUseCase {
   constructor(private teamsRepository: TeamsRepository) {}

   async execute({
      team,
      name,
      description,
   }: UpdateTeamUseCaseRequest): Promise<UpdateTeamUseCaseResponse> {
      team.name = name
      team.description = description

      await this.teamsRepository.save(team)

      return right({ team })
   }
}

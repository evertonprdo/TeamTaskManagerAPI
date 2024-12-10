import { Either, right } from '@/core/either'

import { Team } from '../entities/team'
import { Owner } from '../entities/owner'

import { TeamsRepository } from '../repositories/teams.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface CreateTeamUseCaseRequest {
   userId: string
   name: string
   description: string
}

type CreateTeamUseCaseResponse = Either<
   null,
   {
      team: Team
      owner: Owner
   }
>

export class CreateTeamUseCase {
   constructor(
      private teamsRepository: TeamsRepository,
      private teamMembersRepository: TeamMembersRepository,
   ) {}

   async execute({
      userId,
      name,
      description,
   }: CreateTeamUseCaseRequest): Promise<CreateTeamUseCaseResponse> {
      const team = Team.create({
         name,
         description,
      })

      await this.teamsRepository.create(team)

      const owner = Owner.create({
         teamId: team.id,
         userId: new UniqueEntityID(userId),
      })

      await this.teamMembersRepository.create(owner)

      return right({
         team,
         owner,
      })
   }
}

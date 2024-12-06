import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Team } from '../entities/team'
import { Owner } from '../entities/owner'

import { UsersRepository } from '../repositories/users.repository'
import { TeamsRepository } from '../repositories/teams.repository'
import { OwnersRepository } from '../repositories/owners.repository'

interface CreateTeamUseCaseRequest {
   userId: string
   name: string
   description: string
}

type CreateTeamUseCaseResponse = Either<
   ResourceNotFoundError,
   {
      team: Team
      owner: Owner
   }
>

export class CreateTeamUseCase {
   constructor(
      private usersRepository: UsersRepository,
      private teamsRepository: TeamsRepository,
      private ownersRepository: OwnersRepository,
   ) {}

   async execute({
      userId,
      name,
      description,
   }: CreateTeamUseCaseRequest): Promise<CreateTeamUseCaseResponse> {
      const user = await this.usersRepository.findById(userId)

      if (!user) {
         return left(new ResourceNotFoundError())
      }

      const team = Team.create({
         name,
         description,
      })

      await this.teamsRepository.create(team)

      const owner = Owner.create({
         teamId: team.id,
         userId: user.id,
      })

      await this.ownersRepository.create(owner)

      return right({
         team,
         owner,
      })
   }
}

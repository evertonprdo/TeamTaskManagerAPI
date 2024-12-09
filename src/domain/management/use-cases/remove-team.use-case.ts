import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TeamsRepository } from '../repositories/teams.repository'
import { Owner } from '../entities/owner'

interface RemoveTeamUseCaseRequest {
   teamId: string
}

type RemoveTeamUseCaseResponse = Either<ResourceNotFoundError, null>

export class RemoveTeamUseCase {
   constructor(private teamsRepository: TeamsRepository) {}

   async execute({
      teamId,
   }: RemoveTeamUseCaseRequest): Promise<RemoveTeamUseCaseResponse> {
      const team = await this.teamsRepository.findWithMembersById(teamId)

      if (!team) {
         return left(new ResourceNotFoundError())
      }

      const userIds: UniqueEntityID[] = []

      for (const member of team.members) {
         if (member instanceof Owner) {
            continue
         }

         if (member.status === 'ACTIVE') {
            userIds.push(member.userId)
         }
      }

      team.setupToRemove(userIds)
      await this.teamsRepository.delete(team)

      return right(null)
   }
}

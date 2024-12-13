import { Either, right } from '@/core/either'

import { Team } from '../entities/team'

import { TeamsRepository } from '../repositories/teams.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'

interface RemoveTeamUseCaseRequest {
   team: Team
}

type RemoveTeamUseCaseResponse = Either<null, null>

export class RemoveTeamUseCase {
   constructor(
      private teamsRepository: TeamsRepository,
      private teamMembersRepository: TeamMembersRepository,
   ) {}

   async execute({
      team,
   }: RemoveTeamUseCaseRequest): Promise<RemoveTeamUseCaseResponse> {
      const userIds =
         await this.teamMembersRepository.fetchUserIdsToNotifyOnTeamDelete(
            team.id.toString(),
         )

      team.setupToRemove(userIds)
      await this.teamsRepository.delete(team)

      return right(null)
   }
}

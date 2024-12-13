import { Either, right } from '@/core/either'

import { Team } from '../entities/team'
import { TeamDetails } from '../entities/value-objects/team-details'

import { TasksRepository } from '../repositories/tasks.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'

interface GetTeamDetailsUseCaseRequest {
   team: Team
}

type GetTeamDetailsUseCaseResponse = Either<null, { teamDetails: TeamDetails }>

export class GetTeamDetailsUseCase {
   constructor(
      private teamMembersRepository: TeamMembersRepository,
      private tasksRepository: TasksRepository,
   ) {}

   async execute({
      team,
   }: GetTeamDetailsUseCaseRequest): Promise<GetTeamDetailsUseCaseResponse> {
      const [teamMemberWithName, teamTasks] = await Promise.all([
         this.teamMembersRepository.findManyWithNameByTeamId(
            team.id.toString(),
         ),
         this.tasksRepository.findManyWithAssignedByTeamId({
            teamId: team.id.toString(),
            page: 1,
         }),
      ])

      const teamDetails = TeamDetails.create({
         id: team.id,
         teamName: team.name,
         description: team.description,
         tasks: teamTasks,
         teamMembers: teamMemberWithName,
      })

      return right({ teamDetails })
   }
}

import { Either, left, right } from '@/core/either'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { TeamMember, TeamMemberRole } from '../entities/team-member'
import { TeamMemberDetails } from '../entities/value-objects/team-member-details'

import { TasksRepository } from '../repositories/tasks.repository'
import { UsersRepository } from '../repositories/users.repository'

interface GetTeamMemberDetailsUseCaseRequest {
   teamMember: TeamMember
}

type GetTeamMemberDetailsUseCaseResponse = Either<
   ResourceNotFoundError,
   { teamMemberDetails: TeamMemberDetails }
>

export class GetTeamMemberDetailsUseCase {
   constructor(
      private tasksRepository: TasksRepository,
      private usersRepository: UsersRepository,
   ) {}

   async execute({
      teamMember,
   }: GetTeamMemberDetailsUseCaseRequest): Promise<GetTeamMemberDetailsUseCaseResponse> {
      const [user, teamMemberTasks] = await Promise.all([
         this.usersRepository.findById(teamMember.userId.toString()),
         this.tasksRepository.findManyByTeamMemberId({
            teamMemberId: teamMember.id.toString(),
            page: 1,
         }),
      ])

      if (!user) {
         return left(new ResourceNotFoundError())
      }

      const teamMemberDetails = TeamMemberDetails.create({
         id: teamMember.id,
         name: user.name,
         email: user.email,
         role: teamMember.constructor.name.toUpperCase() as TeamMemberRole,
         status: teamMember.status,
         userId: user.id,
         teamId: teamMember.teamId,
         tasks: teamMemberTasks,
         createdAt: teamMember.createdAt,
      })

      return right({ teamMemberDetails })
   }
}

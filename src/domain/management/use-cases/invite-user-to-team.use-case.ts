import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Team } from '../entities/team'
import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Member } from '../entities/member'
import { TeamMember } from '../entities/team-member'

import { UsersRepository } from '../repositories/users.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'
import { UserEmailNotFoundError } from './errors/user-email-not-found.error'

type Role = 'ADMIN' | 'MEMBER'

interface InviteUserToTeamUseCaseRequest {
   email: string
   role: Role
   team: Team
   invitedBy: Admin | Owner
}

type InviteUserToTeamUseCaseResponse = Either<
   ResourceNotFoundError,
   { teamMember: TeamMember }
>

export class InviteUserToTeamUseCase {
   constructor(
      private usersRepository: UsersRepository,
      private teamMembersRepository: TeamMembersRepository,
   ) {}

   async execute({
      email,
      invitedBy,
      role,
      team,
   }: InviteUserToTeamUseCaseRequest): Promise<InviteUserToTeamUseCaseResponse> {
      const user = await this.usersRepository.findByEmail(email)

      if (!user) {
         return left(new UserEmailNotFoundError(email))
      }

      const Entity = this.getEntity(role)

      const teamMember = Entity.create(
         { teamId: team.id, userId: user.id },
         invitedBy,
      )

      await this.teamMembersRepository.create(teamMember)

      return right({ teamMember })
   }

   private getEntity(role: Role) {
      switch (role) {
         case 'ADMIN':
            return Admin

         case 'MEMBER':
            return Member

         default:
            throw new Error()
      }
   }
}

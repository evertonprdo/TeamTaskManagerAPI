import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { User } from '../entities/user'
import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Member } from '../entities/member'
import { TeamMember } from '../entities/team-member'

import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { UserAlreadyInError } from './errors/user-already-in.error'
import { EmailNotFoundError } from './errors/email-not-found.error'
import { UserAlreadyInvitedError } from './errors/user-already-invited.error'

import { UsersRepository } from '../repositories/users.repository'
import { TeamMembersRepository } from '../repositories/team-members.repository'

type Role = 'ADMIN' | 'MEMBER'

interface InviteUserToTeamUseCaseRequest {
   email: string
   role: Role
   invitedBy: Admin | Owner
}

type InviteUserToTeamUseCaseResponse = Either<
   ResourceNotFoundError | NotAllowedError,
   { teamMember: TeamMember }
>

export class InviteUserToTeamUseCase {
   constructor(
      private usersRepository: UsersRepository,
      private teamMembersRepository: TeamMembersRepository,
   ) {}

   async execute({
      role,
      email,
      invitedBy,
   }: InviteUserToTeamUseCaseRequest): Promise<InviteUserToTeamUseCaseResponse> {
      let TeamMember: typeof Admin | typeof Member

      switch (role) {
         case 'ADMIN':
            if (invitedBy instanceof Admin) {
               return left(new NotAllowedError())
            }

            TeamMember = Admin
            break

         case 'MEMBER':
            TeamMember = Member
            break

         default:
            throw new Error()
      }

      const user = await this.usersRepository.findByEmail(email)

      if (!user) {
         return left(new EmailNotFoundError(email))
      }

      const existingTeamMember =
         await this.teamMembersRepository.findByUserIdAndTeamId({
            teamId: invitedBy.teamId.toString(),
            userId: user.id.toString(),
         })

      if (existingTeamMember) {
         return await this.handleExistingTeamMember(
            existingTeamMember,
            invitedBy,
            TeamMember,
         )
      }

      return await this.handleNewInvite(user, invitedBy, TeamMember)
   }

   private async handleNewInvite(
      user: User,
      invitedBy: Admin | Owner,
      TeamMember: typeof Admin | typeof Member,
   ): Promise<InviteUserToTeamUseCaseResponse> {
      const teamMember = TeamMember.create(
         { teamId: invitedBy.teamId, userId: user.id },
         invitedBy as Owner,
      )

      await this.teamMembersRepository.create(teamMember)
      return right({ teamMember })
   }

   private async handleExistingTeamMember(
      member: TeamMember,
      invitedBy: Admin | Owner,
      TeamMember: typeof Admin | typeof Member,
   ): Promise<InviteUserToTeamUseCaseResponse> {
      switch (member.status) {
         case 'INVITED':
            return left(new UserAlreadyInvitedError())

         case 'ACTIVE':
            return left(new UserAlreadyInError())

         case 'INACTIVE':
            break

         default:
            throw new Error()
      }

      if (!(member instanceof TeamMember)) {
         member = TeamMember.create(
            {
               teamId: member.teamId,
               userId: member.userId,
               status: member.status,
               createdAt: member.createdAt,
               updatedAt: member.updatedAt,
            },
            member.id,
         )
      }

      ;(member as Member).reinviteInactive(invitedBy)
      await this.teamMembersRepository.save(member)

      return right({ teamMember: member })
   }
}

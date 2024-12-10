import { Either, left, right } from '@/core/either'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { TeamMemberAlreadyInRoleError } from './errors/team-member-already-in-role.error'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Member } from '../entities/member'
import { TeamMembersRepository } from '../repositories/team-members.repository'

type Role = 'ADMIN' | 'MEMBER'

interface ChangeTeamMemberRoleRequest {
   changedBy: Owner
   newRole: Role
   teamMemberId: string
}

type ChangeTeamMemberRoleResponse = Either<
   ResourceNotFoundError | TeamMemberAlreadyInRoleError,
   { teamMember: Admin | Member }
>

export class ChangeTeamMemberRole {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      changedBy,
      newRole,
      teamMemberId,
   }: ChangeTeamMemberRoleRequest): Promise<ChangeTeamMemberRoleResponse> {
      const teamMember = await this.teamMembersRepository.findById(teamMemberId)

      if (!teamMember) {
         return left(new ResourceNotFoundError())
      }

      if (teamMember instanceof Owner) {
         return left(new ForbiddenError())
      }

      if (!(changedBy instanceof Owner)) {
         return left(new NotAllowedError())
      }

      if (!teamMember.teamId.equals(changedBy.teamId)) {
         return left(new NotAllowedError())
      }

      if (teamMember.constructor.name.toUpperCase() === newRole) {
         return left(new TeamMemberAlreadyInRoleError(newRole))
      }

      const teamMemberProps = {
         teamId: teamMember.teamId,
         userId: teamMember.userId,
         createdAt: teamMember.createdAt,
         status: teamMember.status,
         updatedAt: teamMember.updatedAt,
      }

      let updatedTeamMember: Admin | Member

      switch (newRole) {
         case 'ADMIN':
            updatedTeamMember = Admin.create(teamMemberProps, teamMember.id)
            break

         case 'MEMBER':
            updatedTeamMember = Member.create(teamMemberProps, teamMember.id)
            break

         default:
            throw new Error()
      }

      updatedTeamMember.setupRoleUpdated(changedBy)
      await this.teamMembersRepository.save(updatedTeamMember)

      return right({ teamMember: updatedTeamMember })
   }
}

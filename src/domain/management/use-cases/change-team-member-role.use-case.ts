import { Either, left, right } from '@/core/either'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'
import { TeamMemberAlreadyInRoleError } from './errors/team-member-already-in-role.error'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Member } from '../entities/member'
import { TeamMembersRepository } from '../repositories/team-members.repository'

type Role = 'ADMIN' | 'MEMBER'

interface ChangeTeamMemberRoleRequest {
   newRole: Role
   teamMemberId: string
}

type ChangeTeamMemberRoleResponse = Either<
   ResourceNotFoundError | TeamMemberAlreadyInRoleError | ForbiddenError,
   { teamMember: Admin | Member }
>

export class ChangeTeamMemberRole {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      newRole,
      teamMemberId,
   }: ChangeTeamMemberRoleRequest): Promise<ChangeTeamMemberRoleResponse> {
      const teamMember = await this.teamMembersRepository.findById(teamMemberId)

      if (!teamMember) {
         return left(new ResourceNotFoundError())
      }

      if (teamMember.status !== 'ACTIVE') {
         return left(new ForbiddenError())
      }

      if (teamMember instanceof Owner) {
         return left(new ForbiddenError())
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

      updatedTeamMember.setupUpdateRole()
      await this.teamMembersRepository.save(updatedTeamMember)

      return right({ teamMember: updatedTeamMember })
   }
}

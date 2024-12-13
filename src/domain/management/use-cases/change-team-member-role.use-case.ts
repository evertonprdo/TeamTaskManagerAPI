import { Either, left, right } from '@/core/either'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { TeamMemberAlreadyInRoleError } from './errors/team-member-already-in-role.error'

import { Admin } from '../entities/admin'
import { Owner } from '../entities/owner'
import { Member } from '../entities/member'

import { TeamMembersRepository } from '../repositories/team-members.repository'

type Role = 'ADMIN' | 'MEMBER'

interface ChangeTeamMemberRoleRequest {
   newRole: Role
   teamMember: Admin | Member
}

type ChangeTeamMemberRoleResponse = Either<
   TeamMemberAlreadyInRoleError | ForbiddenError,
   { teamMember: Admin | Member }
>

export class ChangeTeamMemberRole {
   private roleMapper = {
      ADMIN: Admin,
      MEMBER: Member,
   }

   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      newRole,
      teamMember,
   }: ChangeTeamMemberRoleRequest): Promise<ChangeTeamMemberRoleResponse> {
      if (teamMember.status !== 'ACTIVE') {
         return left(new ForbiddenError())
      }

      if (teamMember instanceof Owner) {
         return left(new ForbiddenError())
      }

      if (teamMember.constructor.name.toUpperCase() === newRole) {
         return left(new TeamMemberAlreadyInRoleError(newRole))
      }

      const updatedTeamMember = this.roleMapper[newRole].create(
         {
            teamId: teamMember.teamId,
            userId: teamMember.userId,
            createdAt: teamMember.createdAt,
            status: teamMember.status,
            updatedAt: teamMember.updatedAt,
         },
         teamMember.id,
      )

      updatedTeamMember.setupUpdateRole()
      await this.teamMembersRepository.save(updatedTeamMember)

      return right({ teamMember: updatedTeamMember })
   }
}

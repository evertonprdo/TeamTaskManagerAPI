import { makeAdmin } from '../tests/factories/make-admin'
import { makeMember } from '../tests/factories/make-member'
import { makeOwner } from '../tests/factories/make-owner'

import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { TeamMemberAlreadyInRoleError } from './errors/team-member-already-in-role.error'

import { Admin } from '../entities/admin'
import { Member } from '../entities/member'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ChangeTeamMemberRole } from './change-team-member-role.use-case'

let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: ChangeTeamMemberRole

describe('Use case: Change team member role', () => {
   beforeEach(() => {
      usersRepository = new InMemoryUsersRepository()
      teamMembersRepository = new InMemoryTeamMembersRepository(usersRepository)

      sut = new ChangeTeamMemberRole(teamMembersRepository)
   })

   it('should be possible to owner change the member role', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: owner.teamId })

      teamMembersRepository.items.push(owner, member)

      const result = await sut.execute({
         changedBy: owner,
         newRole: 'ADMIN',
         teamMemberId: member.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toBeInstanceOf(Admin)
   })

   it('should be possible to owner change the admin role', async () => {
      const owner = makeOwner()
      const member = makeAdmin({ teamId: owner.teamId })

      teamMembersRepository.items.push(owner, member)

      const result = await sut.execute({
         changedBy: owner,
         newRole: 'MEMBER',
         teamMemberId: member.id.toString(),
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toBeInstanceOf(Member)
   })

   it('should be forbidden change a owner role directly', async () => {
      const owner = makeOwner()
      teamMembersRepository.items.push(owner)

      const result = await sut.execute({
         changedBy: owner,
         newRole: 'MEMBER',
         teamMemberId: owner.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ForbiddenError)
   })

   it('should not be possible to change to the same role', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: owner.teamId })

      teamMembersRepository.items.push(owner, member)

      const result = await sut.execute({
         changedBy: owner,
         newRole: 'MEMBER',
         teamMemberId: member.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(TeamMemberAlreadyInRoleError)
   })

   it('should not be possible to change a role from another team', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: new UniqueEntityID('another-team') })
      teamMembersRepository.items.push(member, owner)

      const result = await sut.execute({
         changedBy: owner,
         teamMemberId: member.id.toString(),
         newRole: 'ADMIN',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })
})

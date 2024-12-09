import { makeAdmin } from '../tests/factories/make-admin'
import { makeMember } from '../tests/factories/make-member'
import { makeOwner } from '../tests/factories/make-owner'

import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { TeamMemberAlreadyInRoleError } from './errors/team-member-already-in-role.error'

import { Admin } from '../entities/admin'
import { Member } from '../entities/member'

import { ChangeTeamMemberRole } from './change-team-member-role.use-case'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: ChangeTeamMemberRole

describe('Use case: Change team member role', () => {
   beforeEach(() => {
      tasksRepository = new InMemoryTasksRepository()
      usersRepository = new InMemoryUsersRepository()
      teamMembersRepository = new InMemoryTeamMembersRepository(
         usersRepository,
         tasksRepository,
      )

      sut = new ChangeTeamMemberRole(teamMembersRepository)
   })

   it('should be possible to owner change the member role', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: owner.teamId })

      teamMembersRepository.items.push(owner, member)

      const result = await sut.execute({
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
         newRole: 'MEMBER',
         teamMemberId: owner.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ForbiddenError)
   })

   it('should be forbidden change the role of a non-active member', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: owner.teamId, status: 'INVITED' })

      teamMembersRepository.items.push(owner, member)

      const result = await sut.execute({
         newRole: 'ADMIN',
         teamMemberId: member.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ForbiddenError)
   })

   it('should not be possible to change to the same role', async () => {
      const owner = makeOwner()
      const member = makeMember({ teamId: owner.teamId })

      teamMembersRepository.items.push(owner, member)

      const result = await sut.execute({
         newRole: 'MEMBER',
         teamMemberId: member.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(TeamMemberAlreadyInRoleError)
   })
})

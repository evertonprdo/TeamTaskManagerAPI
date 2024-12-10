import { makeAdmin } from '../tests/factories/make-admin'
import { makeMember } from '../tests/factories/make-member'
import { makeOwner } from '../tests/factories/make-owner'

import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTasksRepository } from '../tests/repositories/in-memory-tasks.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { NotAllowedError } from '@/core/errors/not-allowed.error'

import { RemoveTeamMemberUseCase } from './remove-team-member.use-case'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: RemoveTeamMemberUseCase

describe('Use case: Remove team member', () => {
   beforeEach(() => {
      tasksRepository = new InMemoryTasksRepository()
      usersRepository = new InMemoryUsersRepository()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         usersRepository,
         tasksRepository,
      )

      sut = new RemoveTeamMemberUseCase(teamMembersRepository)
   })

   it('should be possible for the owner to remove a member from a team', async () => {
      const owner = makeOwner()
      const teamMember = makeMember({ teamId: owner.teamId })
      teamMembersRepository.items.push(teamMember)

      const result = await sut.execute({
         teamMemberId: teamMember.id.toString(),
         removingBy: owner,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should be possible for the owner to remove an admin from a team', async () => {
      const owner = makeOwner()
      const admin = makeAdmin({ teamId: owner.teamId })
      teamMembersRepository.items.push(admin)

      const result = await sut.execute({
         teamMemberId: admin.id.toString(),
         removingBy: owner,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should not be possible for the owner to be directly removed from a team', async () => {
      const owner = makeOwner()
      teamMembersRepository.items.push(owner)

      const result = await sut.execute({
         teamMemberId: owner.id.toString(),
         removingBy: owner,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ForbiddenError)
   })

   it('should be possible for an admin to remove a member from a team', async () => {
      const admin = makeAdmin()
      const teamMember = makeMember({ teamId: admin.teamId })
      teamMembersRepository.items.push(teamMember)

      const result = await sut.execute({
         teamMemberId: teamMember.id.toString(),
         removingBy: admin,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should be possible to an admin to quit from a team', async () => {
      const admin = makeAdmin()
      teamMembersRepository.items.push(admin)

      const result = await sut.execute({
         teamMemberId: admin.id.toString(),
         removingBy: admin,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should not be possible for an admin to remove another admin from a team', async () => {
      const admin = makeAdmin()
      const anotherAdmin = makeAdmin({ teamId: admin.teamId })
      teamMembersRepository.items.push(anotherAdmin)

      const result = await sut.execute({
         teamMemberId: anotherAdmin.id.toString(),
         removingBy: admin,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })

   it('should be possible to a member to quit from a team', async () => {
      const member = makeMember()
      teamMembersRepository.items.push(member)

      const result = await sut.execute({
         teamMemberId: member.id.toString(),
         removingBy: member,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should not be possible to a member to remove an admin', async () => {
      const member = makeMember()
      const admin = makeAdmin()
      teamMembersRepository.items.push(admin)

      const result = await sut.execute({
         teamMemberId: admin.id.toString(),
         removingBy: member,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })

   it('should not be possible to a member to remove another member', async () => {
      const member = makeMember()
      const anotherMember = makeMember()
      teamMembersRepository.items.push(anotherMember)

      const result = await sut.execute({
         teamMemberId: anotherMember.id.toString(),
         removingBy: member,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })
})

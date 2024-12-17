import { makeAdmin } from '../_tests/factories/make-admin'
import { makeMember } from '../_tests/factories/make-member'
import { makeOwner } from '../_tests/factories/make-owner'

import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTeamMembersRepository } from '../_tests/repositories/in-memory-team-members.repository'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { NotAllowedError } from '@/core/errors/not-allowed.error'

import { RemoveTeamMemberUseCase } from './remove-team-member.use-case'

let inMemoryDatabase: InMemoryDatabase
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: RemoveTeamMemberUseCase

describe('Use case: Remove team member', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new RemoveTeamMemberUseCase(teamMembersRepository)
   })

   it('should be possible for the owner to remove a member from a team', async () => {
      const owner = makeOwner()
      const teamMember = makeMember({ teamId: owner.teamId })
      inMemoryDatabase.team_members.push(teamMember)

      const result = await sut.execute({
         teamMember: teamMember,
         removingBy: owner,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should be possible for the owner to remove an admin from a team', async () => {
      const owner = makeOwner()
      const admin = makeAdmin({ teamId: owner.teamId })
      inMemoryDatabase.team_members.push(admin)

      const result = await sut.execute({
         teamMember: admin,
         removingBy: owner,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should not be possible for the owner to be directly removed from a team', async () => {
      const owner = makeOwner()
      inMemoryDatabase.team_members.push(owner)

      const result = await sut.execute({
         teamMember: owner as any,
         removingBy: owner,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ForbiddenError)
   })

   it('should be possible for an admin to remove a member from a team', async () => {
      const admin = makeAdmin()
      const teamMember = makeMember({ teamId: admin.teamId })
      inMemoryDatabase.team_members.push(teamMember)

      const result = await sut.execute({
         teamMember: teamMember,
         removingBy: admin,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should be possible to an admin to quit from a team', async () => {
      const admin = makeAdmin()
      inMemoryDatabase.team_members.push(admin)

      const result = await sut.execute({
         teamMember: admin,
         removingBy: admin,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should not be possible for an admin to remove another admin from a team', async () => {
      const admin = makeAdmin()
      const anotherAdmin = makeAdmin({ teamId: admin.teamId })
      inMemoryDatabase.team_members.push(anotherAdmin)

      const result = await sut.execute({
         teamMember: anotherAdmin,
         removingBy: admin,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })

   it('should be possible to a member to quit from a team', async () => {
      const member = makeMember()
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         teamMember: member,
         removingBy: member,
      })

      expect(result.isRight()).toBe(true)
      if (result.isLeft()) throw new Error()

      expect(result.value.teamMember.status).toEqual('INACTIVE')
   })

   it('should not be possible to a member to remove an admin', async () => {
      const member = makeMember()
      const admin = makeAdmin()
      inMemoryDatabase.team_members.push(admin)

      const result = await sut.execute({
         teamMember: admin,
         removingBy: member,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })

   it('should not be possible to a member to remove another member', async () => {
      const member = makeMember()
      const anotherMember = makeMember()
      inMemoryDatabase.team_members.push(anotherMember)

      const result = await sut.execute({
         teamMember: anotherMember,
         removingBy: member,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })
})

import { makeUser } from '../tests/factories/make-user'
import { makeAdmin } from '../tests/factories/make-admin'
import { makeOwner } from '../tests/factories/make-owner'
import { makeMember } from '../tests/factories/make-member'

import { InMemoryDatabase } from '../tests/repositories/in-memory-database'
import { InMemoryUsersRepository } from '../tests/repositories/in-memory-users.repository'
import { InMemoryTeamMembersRepository } from '../tests/repositories/in-memory-team-members.repository'

import { NotAllowedError } from '@/core/errors/not-allowed.error'
import { UserAlreadyInError } from './errors/user-already-in.error'
import { EmailNotFoundError } from './errors/email-not-found.error'
import { UserAlreadyInvitedError } from './errors/user-already-invited.error'

import { Admin } from '../entities/admin'
import { Member } from '../entities/member'

import { InviteUserToTeamUseCase } from './invite-user-to-team.use-case'

let inMemoryDatabase: InMemoryDatabase
let usersRepository: InMemoryUsersRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: InviteUserToTeamUseCase

describe('Use case: Invite user to team', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      usersRepository = new InMemoryUsersRepository(inMemoryDatabase)

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new InviteUserToTeamUseCase(usersRepository, teamMembersRepository)
   })

   it('should invite a user to a team by email', async () => {
      const owner = makeOwner()
      inMemoryDatabase.team_members.push(owner)

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const result = await sut.execute({
         email: user.email,
         invitedBy: owner,
         role: 'MEMBER',
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toMatchObject({
         userId: user.id,
         teamId: owner.teamId,
         status: 'INVITED',
      })

      expect(result.value.teamMember).toBeInstanceOf(Member)
      expect(inMemoryDatabase.team_members[1]).toEqual(result.value.teamMember)
   })

   it('should not be possible to an Admin invite a user as admin', async () => {
      const admin = makeAdmin()
      inMemoryDatabase.team_members.push(admin)

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const result = await sut.execute({
         email: user.email,
         invitedBy: admin,
         role: 'ADMIN',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
   })

   it('should not be possible to invite a user that does not exist', async () => {
      const owner = makeOwner()

      const result = await sut.execute({
         email: 'any@email.com',
         invitedBy: owner,
         role: 'MEMBER',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(EmailNotFoundError)
   })

   it('should not be possible to invite the same user twice', async () => {
      const owner = makeOwner()
      inMemoryDatabase.team_members.push(owner)

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const teamMember = makeMember({
         teamId: owner.teamId,
         userId: user.id,
         status: 'INVITED',
      })
      inMemoryDatabase.team_members.push(teamMember)

      const result = await sut.execute({
         email: user.email,
         invitedBy: owner,
         role: 'MEMBER',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(UserAlreadyInvitedError)
   })

   it('should not be possible to invite a member who is already on the team', async () => {
      const owner = makeOwner()
      inMemoryDatabase.team_members.push(owner)

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const teamMember = makeMember({
         teamId: owner.teamId,
         userId: user.id,
         status: 'ACTIVE',
      })
      inMemoryDatabase.team_members.push(teamMember)

      const result = await sut.execute({
         email: user.email,
         invitedBy: owner,
         role: 'MEMBER',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(UserAlreadyInError)
   })

   it('should be possible to re-invite an ex-member with the new desired role. case: Member to Member', async () => {
      const owner = makeOwner()
      inMemoryDatabase.team_members.push(owner)

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const member = makeMember({
         teamId: owner.teamId,
         userId: user.id,
         status: 'INACTIVE',
      })
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         email: user.email,
         invitedBy: owner,
         role: 'MEMBER',
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toBeInstanceOf(Member)
   })

   it('should be possible to re-invite an ex-member with the new desired role. case: Admin to Admin', async () => {
      const owner = makeOwner()
      inMemoryDatabase.team_members.push(owner)

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const admin = makeAdmin({
         teamId: owner.teamId,
         userId: user.id,
         status: 'INACTIVE',
      })
      inMemoryDatabase.team_members.push(admin)

      const result = await sut.execute({
         email: user.email,
         invitedBy: owner,
         role: 'ADMIN',
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toBeInstanceOf(Admin)
   })

   it('should be possible to re-invite an ex-member with the new desired role. case: Member to Admin', async () => {
      const owner = makeOwner()
      inMemoryDatabase.team_members.push(owner)

      const user = makeUser()
      inMemoryDatabase.users.push(user)

      const member = makeMember({
         teamId: owner.teamId,
         userId: user.id,
         status: 'INACTIVE',
      })
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         email: user.email,
         invitedBy: owner,
         role: 'ADMIN',
      })

      expect(result.isRight()).toBe(true)

      if (result.isLeft()) {
         throw new Error()
      }

      expect(result.value.teamMember).toBeInstanceOf(Admin)
   })
})

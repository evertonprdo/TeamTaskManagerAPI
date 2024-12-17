import { makeMember } from '../_tests/factories/make-member'
import { InMemoryDatabase } from '../_tests/repositories/in-memory-database'
import { InMemoryTeamMembersRepository } from '../_tests/repositories/in-memory-team-members.repository'

import { AnswerInvitationUseCase } from './answer-invitation.use-case'
import { InvitationAlreadyAnsweredError } from './errors/invitation-already-answered.error'

let inMemoryDatabase: InMemoryDatabase
let teamMembersRepository: InMemoryTeamMembersRepository

let sut: AnswerInvitationUseCase

describe('Use case: Answer Invitation', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      sut = new AnswerInvitationUseCase(teamMembersRepository)
   })

   it('should be possible to accept an invitation', async () => {
      const member = makeMember({ status: 'INVITED' })
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         teamMember: member,
         isAnswerAccepted: true,
      })

      expect(result.isRight()).toBe(true)
      expect(result.value).toEqual({
         teamMember: expect.objectContaining({ status: 'ACTIVE' }),
      })

      expect(inMemoryDatabase.team_members).toHaveLength(1)
      expect(inMemoryDatabase.team_members[0].id).toEqual(member.id)
   })

   it('should be possible to decline an invitation', async () => {
      const member = makeMember({ status: 'INVITED' })
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         teamMember: member,
         isAnswerAccepted: false,
      })

      expect(result.isRight()).toBe(true)
      expect(result.value).toBe(null)
   })

   it('should not be possible to answer an invitation twice', async () => {
      const member = makeMember({ status: 'ACTIVE' })
      inMemoryDatabase.team_members.push(member)

      const result = await sut.execute({
         teamMember: member,
         isAnswerAccepted: true,
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvitationAlreadyAnsweredError)
   })
})

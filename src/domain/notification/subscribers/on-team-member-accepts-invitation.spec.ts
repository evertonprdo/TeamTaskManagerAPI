import { waitFor } from '@/core/_tests/utils/wait-for'

import { Member } from '@management/entities/member'
import { makeTeam } from '@management/_tests/factories/make-team'
import { makeUser } from '@management/_tests/factories/make-user'
import { makeAdmin } from '@management/_tests/factories/make-admin'

import { InMemoryDatabase } from '@management/_tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '@management/_tests/repositories/in-memory-teams.repository'
import { InMemoryTeamMembersRepository } from '@management/_tests/repositories/in-memory-team-members.repository'

import { InMemoryNotificationsRepository } from '../_tests/repositories/in-memory-notifications.repository'
import {
   SendManyNotificationsUseCase,
   SendManyNotificationsUseCaseRequest,
   SendManyNotificationsUseCaseResponse,
} from '../use-cases/send-many-notifications.use-case'

import { OnTeamMemberAcceptsInvitation } from './on-team-member-accepts-invitation'

let inMemoryDatabase: InMemoryDatabase
let teamsRepository: InMemoryTeamsRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let notificationsRepository: InMemoryNotificationsRepository

let sendManyNotifications: SendManyNotificationsUseCase
let sendManyNotificationsSpyExecute: jest.SpyInstance<
   Promise<SendManyNotificationsUseCaseResponse>,
   [SendManyNotificationsUseCaseRequest]
>

describe('Subscriber: On team member accepts invitation', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)
      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      notificationsRepository = new InMemoryNotificationsRepository()
      sendManyNotifications = new SendManyNotificationsUseCase(
         notificationsRepository,
      )

      sendManyNotificationsSpyExecute = jest.spyOn(
         sendManyNotifications,
         'execute',
      )

      new OnTeamMemberAcceptsInvitation(
         teamsRepository,
         teamMembersRepository,
         sendManyNotifications,
      )
   })

   it('should send a notification to each team member when a new member joins', async () => {
      const team = makeTeam()
      inMemoryDatabase.teams.push(team)

      const [newUser, ...users] = Array.from({ length: 7 }, () => makeUser())
      inMemoryDatabase.users.push(newUser, ...users)

      const members = users.map((user) =>
         makeAdmin({ teamId: team.id, userId: user.id }),
      )
      inMemoryDatabase.team_members.push(...members)

      const newMember = Member.create(
         { teamId: team.id, userId: newUser.id },
         members[0],
      )
      inMemoryDatabase.team_members.push(newMember)

      newMember.acceptInvite()
      teamMembersRepository.save(newMember)

      await waitFor(() =>
         expect(sendManyNotificationsSpyExecute).toHaveBeenCalled(),
      )

      const [[callArgs]] = sendManyNotificationsSpyExecute.mock.calls
      expect(callArgs.recipientIds).toHaveLength(6)

      expect(sendManyNotificationsSpyExecute).toHaveBeenCalledWith(
         expect.objectContaining({
            recipientIds: expect.arrayContaining(
               users.map((user) => user.id.toString()),
            ),
         }),
      )
   })
})

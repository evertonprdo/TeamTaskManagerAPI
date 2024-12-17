import { waitFor } from '@/core/_tests/utils/wait-for'

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

import { OnTeamRemoved } from './on-team-removed'

let inMemoryDatabase: InMemoryDatabase
let teamsRepository: InMemoryTeamsRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let notificationsRepository: InMemoryNotificationsRepository

let sendManyNotifications: SendManyNotificationsUseCase
let sendManyNotificationsSpyExecute: jest.SpyInstance<
   Promise<SendManyNotificationsUseCaseResponse>,
   [SendManyNotificationsUseCaseRequest]
>

describe('Subscriber: On team removed', () => {
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

      new OnTeamRemoved(sendManyNotifications)
   })

   it('should send a notification to each team member when the team is removed', async () => {
      const team = makeTeam()
      inMemoryDatabase.teams.push(team)

      const users = Array.from({ length: 7 }, () => makeUser())
      inMemoryDatabase.users.push(...users)

      const members = users.map((user) =>
         makeAdmin({ teamId: team.id, userId: user.id }),
      )
      inMemoryDatabase.team_members.push(...members)

      team.setupToRemove(users.map((user) => user.id.toString()))
      teamsRepository.delete(team)

      await waitFor(() =>
         expect(sendManyNotificationsSpyExecute).toHaveBeenCalled(),
      )

      const [[callArgs]] = sendManyNotificationsSpyExecute.mock.calls
      expect(callArgs.recipientIds).toHaveLength(7)

      expect(sendManyNotificationsSpyExecute).toHaveBeenCalledWith(
         expect.objectContaining({
            recipientIds: expect.arrayContaining(
               users.map((user) => user.id.toString()),
            ),
         }),
      )
   })
})

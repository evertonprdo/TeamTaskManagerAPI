import { waitFor } from '@/core/_tests/utils/wait-for'

import { makeUser } from '@management/_tests/factories/make-user'
import { makeTeam } from '@management/_tests/factories/make-team'
import { makeOwner } from '@management/_tests/factories/make-owner'
import { makeMember } from '@management/_tests/factories/make-member'

import { InMemoryDatabase } from '@management/_tests/repositories/in-memory-database'
import { InMemoryUsersRepository } from '@management/_tests/repositories/in-memory-users.repository'
import { InMemoryTeamsRepository } from '@management/_tests/repositories/in-memory-teams.repository'
import { InMemoryTeamMembersRepository } from '@management/_tests/repositories/in-memory-team-members.repository'

import { InMemoryNotificationsRepository } from '../_tests/repositories/in-memory-notifications.repository'

import {
   SendNotificationUseCase,
   SendNotificationUseCaseRequest,
   SendNotificationUseCaseResponse,
} from '../use-cases/send-notification.use-case'

import {
   SendManyNotificationsUseCase,
   SendManyNotificationsUseCaseRequest,
   SendManyNotificationsUseCaseResponse,
} from '../use-cases/send-many-notifications.use-case'

import { OnOwnershipPassed } from './on-ownership-passed'

let inMemoryDatabase: InMemoryDatabase

let usersRepository: InMemoryUsersRepository
let teamsRepository: InMemoryTeamsRepository
let teamMembersRepository: InMemoryTeamMembersRepository

let notificationsRepository: InMemoryNotificationsRepository
let sendNotification: SendNotificationUseCase
let sendManyNotifications: SendManyNotificationsUseCase

let sendNotificationExecuteSpy: jest.SpyInstance<
   Promise<SendNotificationUseCaseResponse>,
   [SendNotificationUseCaseRequest]
>

let sendManyNotificationsExecuteSpy: jest.SpyInstance<
   Promise<SendManyNotificationsUseCaseResponse>,
   [SendManyNotificationsUseCaseRequest]
>

describe('Subscriber: On Task Assigned', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      usersRepository = new InMemoryUsersRepository(inMemoryDatabase)
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      notificationsRepository = new InMemoryNotificationsRepository()

      sendNotification = new SendNotificationUseCase(notificationsRepository)
      sendManyNotifications = new SendManyNotificationsUseCase(
         notificationsRepository,
      )

      sendNotificationExecuteSpy = jest.spyOn(sendNotification, 'execute')

      sendManyNotificationsExecuteSpy = jest.spyOn(
         sendManyNotifications,
         'execute',
      )

      new OnOwnershipPassed({
         teamsRepository,
         teamMembersRepository,
         sendNotification,
         sendManyNotifications,
         usersRepository,
      })
   })

   it('should send a notification to the new owner when the ownership is passed', async () => {
      const team = makeTeam()
      const owner = makeOwner({ teamId: team.id })

      const newOwnerUser = makeUser()
      const newOwner = makeOwner({ teamId: team.id, userId: newOwnerUser.id })

      inMemoryDatabase.users.push(newOwnerUser)
      inMemoryDatabase.teams.push(team)
      inMemoryDatabase.team_members.push(owner, newOwner)

      owner.remove(newOwner)
      teamMembersRepository.removeOwner(owner)

      await waitFor(() => {
         expect(sendNotificationExecuteSpy).toHaveBeenCalled()
      })

      expect(sendNotificationExecuteSpy).toHaveBeenCalledWith(
         expect.objectContaining({
            recipientId: newOwner.userId.toString(),
         }),
      )
   })

   it('should send a notification to the team members when the ownership is passed', async () => {
      const team = makeTeam()

      const oldOwnerUser = makeUser()
      const owner = makeOwner({ teamId: team.id, userId: oldOwnerUser.id })

      const newOwnerUser = makeUser()
      const newOwner = makeOwner({ teamId: team.id, userId: newOwnerUser.id })

      inMemoryDatabase.teams.push(team)
      inMemoryDatabase.users.push(newOwnerUser, oldOwnerUser)
      inMemoryDatabase.team_members.push(owner, newOwner)

      const users = Array.from({ length: 7 }, () => makeUser())
      const members = users.map((user) =>
         makeMember({ userId: user.id, teamId: team.id }),
      )

      inMemoryDatabase.users.push(...users)
      inMemoryDatabase.team_members.push(...members)

      owner.remove(newOwner)
      teamMembersRepository.removeOwner(owner)

      await waitFor(() => {
         expect(sendManyNotificationsExecuteSpy).toHaveBeenCalled()
      })

      expect(sendManyNotificationsExecuteSpy).toHaveBeenCalledWith(
         expect.objectContaining({
            recipientIds: expect.arrayContaining(
               users.map((user) => user.id.toString()),
            ),
         }),
      )

      const [[callArgs]] = sendManyNotificationsExecuteSpy.mock.calls
      expect(callArgs.recipientIds).toHaveLength(7)
   })
})

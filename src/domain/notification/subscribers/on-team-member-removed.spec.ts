import { waitFor } from '@/core/_tests/utils/wait-for'

import { makeTeam } from '@management/_tests/factories/make-team'
import { makeUser } from '@management/_tests/factories/make-user'
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

import { OnTeamMemberRemoved } from './on-team-member-removed'

let inMemoryDatabase: InMemoryDatabase

let teamMembersRepository: InMemoryTeamMembersRepository
let usersRepository: InMemoryUsersRepository
let teamsRepository: InMemoryTeamsRepository

let notificationsRepository: InMemoryNotificationsRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: jest.SpyInstance<
   Promise<SendNotificationUseCaseResponse>,
   [SendNotificationUseCaseRequest]
>

describe('Subscriber: On Team Member Removed', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      usersRepository = new InMemoryUsersRepository(inMemoryDatabase)
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      notificationsRepository = new InMemoryNotificationsRepository()

      sendNotificationUseCase = new SendNotificationUseCase(
         notificationsRepository,
      )

      sendNotificationExecuteSpy = jest.spyOn(
         sendNotificationUseCase,
         'execute',
      )

      new OnTeamMemberRemoved(
         usersRepository,
         teamsRepository,
         sendNotificationUseCase,
      )
   })

   it('should send a notification to removed member', async () => {
      const team = makeTeam()
      const user = makeUser()
      const owner = makeOwner({ teamId: team.id, userId: user.id })
      const member = makeMember({ teamId: team.id })

      inMemoryDatabase.teams.push(team)
      inMemoryDatabase.users.push(user)
      inMemoryDatabase.team_members.push(owner, member)

      member.remove(owner)
      teamMembersRepository.save(member)

      await waitFor(() => {
         expect(sendNotificationExecuteSpy).toHaveBeenCalled()
      })

      expect(sendNotificationExecuteSpy).toHaveBeenCalledWith(
         expect.objectContaining({
            recipientId: member.userId.toString(),
         }),
      )
   })
})

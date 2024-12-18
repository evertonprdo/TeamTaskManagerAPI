import { waitFor } from '@/core/_tests/utils/wait-for'

import { Member } from '@management/entities/member'
import { makeTeam } from '@management/_tests/factories/make-team'
import { makeUser } from '@management/_tests/factories/make-user'
import { makeOwner } from '@management/_tests/factories/make-owner'

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

import { OnTeamMemberCreated } from './on-team-member-created.event'

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

describe('Subscriber: On Team Member Created', () => {
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

      new OnTeamMemberCreated(
         sendNotificationUseCase,
         usersRepository,
         teamsRepository,
      )
   })

   it('should send a invitation notification on team member created', async () => {
      const team = makeTeam()
      const user = makeUser()
      const owner = makeOwner({ teamId: team.id })

      inMemoryDatabase.teams.push(team)
      inMemoryDatabase.users.push(user)
      inMemoryDatabase.team_members.push(owner)

      const member = Member.create(
         {
            teamId: owner.teamId,
            userId: user.id,
         },
         owner,
      )

      teamMembersRepository.create(member)

      await waitFor(() => {
         expect(sendNotificationExecuteSpy).toHaveBeenCalled()
      })
   })
})

import { waitFor } from '@/core/tests/utils/wait-for'

import { Member } from '@/domain/management/entities/member'
import { makeTeam } from '@/domain/management/tests/factories/make-team'
import { makeUser } from '@/domain/management/tests/factories/make-user'
import { makeOwner } from '@/domain/management/tests/factories/make-owner'

import { InMemoryDatabase } from '@/domain/management/tests/repositories/in-memory-database'
import { InMemoryUsersRepository } from '@/domain/management/tests/repositories/in-memory-users.repository'
import { InMemoryTeamsRepository } from '@/domain/management/tests/repositories/in-memory-teams.repository'
import { InMemoryTeamMembersRepository } from '@/domain/management/tests/repositories/in-memory-team-members.repository'

import { InMemoryNotificationsRepository } from '../tests/repositories/in-memory-notifications.repository'

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

      await teamMembersRepository.create(member)

      await waitFor(() => {
         expect(sendNotificationExecuteSpy).toHaveBeenCalled()
      })
   })
})

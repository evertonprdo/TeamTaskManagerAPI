import { waitFor } from '@/core/tests/utils/wait-for'

import { makeTeam } from '@management/tests/factories/make-team'
import { makeOwner } from '@management/tests/factories/make-owner'

import { InMemoryDatabase } from '@management/tests/repositories/in-memory-database'
import { InMemoryTeamsRepository } from '@management/tests/repositories/in-memory-teams.repository'
import { InMemoryTeamMembersRepository } from '@management/tests/repositories/in-memory-team-members.repository'

import { InMemoryNotificationsRepository } from '../tests/repositories/in-memory-notifications.repository'

import {
   SendNotificationUseCase,
   SendNotificationUseCaseRequest,
   SendNotificationUseCaseResponse,
} from '../use-cases/send-notification.use-case'

import { OnTaskEventTriggered } from './on-task-event-trigged'

import { makeTask } from '@/domain/management/tests/factories/make-task'
import { InMemoryTasksRepository } from '@/domain/management/tests/repositories/in-memory-tasks.repository'

let inMemoryDatabase: InMemoryDatabase

let teamMembersRepository: InMemoryTeamMembersRepository
let tasksRepository: InMemoryTasksRepository
let teamsRepository: InMemoryTeamsRepository

let notificationsRepository: InMemoryNotificationsRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: jest.SpyInstance<
   Promise<SendNotificationUseCaseResponse>,
   [SendNotificationUseCaseRequest]
>

describe('Subscriber: On Task Event Trigged', () => {
   beforeEach(() => {
      inMemoryDatabase = new InMemoryDatabase()

      teamMembersRepository = new InMemoryTeamMembersRepository(
         inMemoryDatabase,
      )

      tasksRepository = new InMemoryTasksRepository(inMemoryDatabase)
      teamsRepository = new InMemoryTeamsRepository(inMemoryDatabase)

      notificationsRepository = new InMemoryNotificationsRepository()

      sendNotificationUseCase = new SendNotificationUseCase(
         notificationsRepository,
      )

      sendNotificationExecuteSpy = jest.spyOn(
         sendNotificationUseCase,
         'execute',
      )

      new OnTaskEventTriggered(
         teamsRepository,
         teamMembersRepository,
         sendNotificationUseCase,
      )
   })

   it('should send a notification when a task has been assigned', async () => {
      const team = makeTeam()
      const owner = makeOwner({ teamId: team.id })

      inMemoryDatabase.teams.push(team)
      inMemoryDatabase.team_members.push(owner)

      const task = makeTask({ teamId: team.id })
      inMemoryDatabase.tasks.push(task)

      task.assign(owner.id)
      tasksRepository.save(task)

      await waitFor(() => {
         expect(sendNotificationExecuteSpy).toHaveBeenCalled()
      })
   })

   // it should be decomposed into unique events
})

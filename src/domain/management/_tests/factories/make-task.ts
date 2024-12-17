import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task, TaskProps } from '../../entities/task'

export function makeTask(
   overwrite: Partial<TaskProps> = {},
   id?: UniqueEntityID,
) {
   const task = Task.create(
      {
         title: faker.lorem.sentence(5),
         description: faker.lorem.paragraph(),
         status: 'UNASSIGN',
         priority: faker.helpers.arrayElement(['HIGH', 'MEDIUM', 'LOW']),
         teamId: new UniqueEntityID(),
         createdAt: new Date(),
         ...overwrite,
      },
      id ?? new UniqueEntityID(),
   )

   return task
}

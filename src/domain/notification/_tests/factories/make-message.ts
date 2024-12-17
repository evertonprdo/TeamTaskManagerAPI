import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Message, MessageProps } from '../../entities/message'

export function makeMessage(
   overwrite: Partial<MessageProps> = {},
   id?: UniqueEntityID,
) {
   const message = Message.create(
      {
         title: faker.lorem.sentence(),
         content: faker.lorem.paragraph(),
         ...overwrite,
      },
      id,
   )

   return message
}

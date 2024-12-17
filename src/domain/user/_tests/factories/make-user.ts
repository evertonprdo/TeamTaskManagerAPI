import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '../../entities/user'

export function makeUser(
   overwrite: Partial<UserProps> = {},
   id?: UniqueEntityID,
) {
   const user = User.create(
      {
         name: faker.person.fullName(),
         email: faker.internet.email(),
         password: faker.internet.password(),
         ...overwrite,
      },
      id,
   )

   return user
}

import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Team, TeamProps } from '../../entities/team'

export function makeTeam(
   overwrite: Partial<TeamProps> = {},
   id?: UniqueEntityID,
) {
   const team = Team.create(
      {
         name: faker.person.fullName(),
         description: faker.lorem.paragraph(),
         ...overwrite,
      },
      id,
   )

   return team
}

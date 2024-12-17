import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TeamMemberProps } from '../../entities/team-member'
import { Owner } from '../../entities/owner'

export function makeOwner(
   overwrite: Partial<TeamMemberProps> = {},
   id?: UniqueEntityID,
) {
   const owner = Owner.create(
      {
         teamId: new UniqueEntityID(),
         userId: new UniqueEntityID(),
         ...overwrite,
      },
      id,
   )

   return owner
}

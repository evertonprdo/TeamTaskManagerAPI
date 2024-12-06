import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TeamMemberProps } from '../../entities/team-member'
import { Admin } from '../../entities/admin'

export function makeAdmin(
   overwrite: Partial<TeamMemberProps> = {},
   id?: UniqueEntityID,
) {
   const admin = Admin.create(
      {
         teamId: new UniqueEntityID(),
         userId: new UniqueEntityID(),
         ...overwrite,
      },
      id,
   )

   return admin
}

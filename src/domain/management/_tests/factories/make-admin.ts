import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TeamMemberProps } from '../../entities/team-member'
import { Admin } from '../../entities/admin'

export function makeAdmin(
   overwrite: Partial<TeamMemberProps> = {},
   id?: UniqueEntityID,
) {
   const admin = Admin.create(
      {
         userId: new UniqueEntityID(),
         teamId: new UniqueEntityID(),
         status: 'ACTIVE',
         createdAt: new Date(),
         ...overwrite,
      },
      id ?? new UniqueEntityID(),
   )

   return admin
}

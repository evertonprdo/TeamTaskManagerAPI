import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Member } from '../../entities/member'
import { TeamMemberProps } from '../../entities/team-member'

export function makeMember(
   overwrite: Partial<TeamMemberProps> = {},
   id?: UniqueEntityID,
) {
   const member = Member.create(
      {
         userId: new UniqueEntityID(),
         teamId: new UniqueEntityID(),
         status: 'ACTIVE',
         createdAt: new Date(),
         ...overwrite,
      },
      id ?? new UniqueEntityID(),
   )

   return member
}

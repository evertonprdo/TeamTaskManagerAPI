import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Member } from '../../entities/member'
import { TeamMemberProps } from '../../entities/team-member'

export function makeMember(
   overwrite: Partial<TeamMemberProps> = {},
   id?: UniqueEntityID,
) {
   const member = Member.create(
      {
         teamId: new UniqueEntityID(),
         userId: new UniqueEntityID(),
         ...overwrite,
      },
      id,
   )

   return member
}

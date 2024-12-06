import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { TeamMember, TeamMemberProps } from './team-member'

export class Owner extends TeamMember {
   static create(
      props: Optional<TeamMemberProps, 'createdAt' | 'status'>,
      id?: UniqueEntityID,
   ) {
      const owner = new Owner(
         {
            ...props,
            createdAt: props.createdAt ?? new Date(),
            status: props.status ?? 'INVITED',
         },
         id,
      )

      return owner
   }
}

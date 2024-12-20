import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { TeamMember, TeamMemberProps } from './team-member'
import { OwnershipPassedEvent } from '../events/ownership-passed.event'

export class Owner extends TeamMember {
   private __owner = 'owner'

   remove(passingOwnershipTo: TeamMember): void {
      this.touch()

      this.addDomainEvent(new OwnershipPassedEvent(this, passingOwnershipTo))
   }

   static create(
      props: Optional<TeamMemberProps, 'createdAt' | 'status'>,
      id?: UniqueEntityID,
   ) {
      const owner = new Owner(
         {
            ...props,
            createdAt: props.createdAt ?? new Date(),
            status: props.status ?? 'ACTIVE',
         },
         id,
      )

      return owner
   }
}

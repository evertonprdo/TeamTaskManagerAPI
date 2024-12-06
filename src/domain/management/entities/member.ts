import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { TeamMember, TeamMemberProps } from './team-member'

import { TeamMemberCreatedEvent } from '../events/team-member-created.event'
import { TeamMemberAcceptedInvitationEvent } from '../events/team-member-accepted-invitation.event'

export class Member extends TeamMember {
   acceptInvite() {
      this.props.status = 'ACTIVE'
      this.touch()

      this.addDomainEvent(new TeamMemberAcceptedInvitationEvent(this))
   }

   removeFromTeam() {
      this.props.status = 'INACTIVE'
      this.touch()
   }

   static create(
      props: Optional<TeamMemberProps, 'createdAt' | 'status'>,
      id?: UniqueEntityID,
   ) {
      const member = new Member(
         {
            ...props,
            createdAt: props.createdAt ?? new Date(),
            status: props.status ?? 'INVITED',
         },
         id,
      )

      const isNewMember = !id

      if (isNewMember) {
         member.addDomainEvent(new TeamMemberCreatedEvent(member))
      }

      return member
   }
}

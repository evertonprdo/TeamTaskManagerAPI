import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { Admin } from './admin'
import { Owner } from './owner'
import { TeamMember, TeamMemberProps } from './team-member'

import { TeamMemberCreatedEvent } from '../events/team-member-created.event'
import { TeamMemberRemovedEvent } from '../events/team-member-removed.event'
import { TeamMemberAcceptedInvitationEvent } from '../events/team-member-accepted-invitation.event'

export class Member extends TeamMember {
   acceptInvite() {
      this.props.status = 'ACTIVE'
      this.touch()

      this.addDomainEvent(new TeamMemberAcceptedInvitationEvent(this))
   }

   remove(removedBy: TeamMember) {
      this.props.status = 'INACTIVE'
      this.touch()

      this.addDomainEvent(new TeamMemberRemovedEvent(this, removedBy))
   }

   static create(
      props: Optional<TeamMemberProps, 'createdAt' | 'status'>,
      id: UniqueEntityID,
   ): Member

   static create(
      props: Omit<TeamMemberProps, 'createdAt' | 'status' | 'updatedAt'>,
      createBy: Admin | Owner,
   ): Member

   static create(
      props: Optional<TeamMemberProps, 'createdAt' | 'status'>,
      secondProp: UniqueEntityID | Admin | Owner,
   ) {
      if (secondProp instanceof UniqueEntityID) {
         return new Member(
            {
               ...props,
               createdAt: props.createdAt ?? new Date(),
               status: props.status ?? 'INVITED',
            },
            secondProp,
         )
      }

      const member = new Member({
         ...props,
         createdAt: new Date(),
         status: 'INVITED',
      })

      member.addDomainEvent(new TeamMemberCreatedEvent(member, secondProp))
      return member
   }
}

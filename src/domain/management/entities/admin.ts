import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { Owner } from './owner'
import { TeamMember, TeamMemberProps } from './team-member'

import { TeamMemberCreatedEvent } from '../events/team-member-created.event'
import { TeamMemberRemovedEvent } from '../events/team-member-removed.event'
import { TeamMemberAcceptedInvitationEvent } from '../events/team-member-accepted-invitation.event'
import { TeamMemberRoleUpdatedEvent } from '../events/team-member-role-updated.event'

export interface CreateAdminProps {
   props: Optional<TeamMemberProps, 'createdAt' | 'status'>
   id?: UniqueEntityID
   createBy?: Admin | Owner
}

export class Admin extends TeamMember {
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

   setupRoleUpdated(changedBy: Owner) {
      this.touch()
      this.addDomainEvent(
         new TeamMemberRoleUpdatedEvent(this, changedBy, 'MEMBER'),
      )
   }

   static create(
      props: Optional<TeamMemberProps, 'createdAt' | 'status'>,
      id: UniqueEntityID,
   ): Admin

   static create(
      props: Omit<TeamMemberProps, 'createdAt' | 'status' | 'updatedAt'>,
      createBy: Admin | Owner,
   ): Admin

   static create(
      props: Optional<TeamMemberProps, 'createdAt' | 'status'>,
      secondProp: UniqueEntityID | Admin | Owner,
   ) {
      if (secondProp instanceof UniqueEntityID) {
         return new Admin(
            {
               ...props,
               createdAt: props.createdAt ?? new Date(),
               status: props.status ?? 'INVITED',
            },
            secondProp,
         )
      }

      const member = new Admin({
         ...props,
         createdAt: new Date(),
         status: 'INVITED',
      })

      member.addDomainEvent(new TeamMemberCreatedEvent(member, secondProp))
      return member
   }
}

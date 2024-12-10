import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { Owner } from './owner'
import { TeamMember, TeamMemberProps } from './team-member'

import { TeamMemberCreatedEvent } from '../events/team-member-created.event'
import { TeamMemberRemovedEvent } from '../events/team-member-removed.event'
import { TeamMemberRoleUpdatedEvent } from '../events/team-member-role-updated.event'
import { TeamMemberAcceptedInvitationEvent } from '../events/team-member-accepted-invitation.event'

export interface CreateAdminProps {
   props: Optional<TeamMemberProps, 'createdAt' | 'status'>
   id?: UniqueEntityID
   createBy?: Admin | Owner
}

export class Admin extends TeamMember {
   private __admin = 'admin'

   reinviteInactive(invitedBy: Owner) {
      this.addDomainEvent(new TeamMemberCreatedEvent(this, invitedBy))
   }

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

   setupUpdateRole() {
      this.touch()
      this.addDomainEvent(new TeamMemberRoleUpdatedEvent(this, 'MEMBER'))
   }

   static create(props: TeamMemberProps, id: UniqueEntityID): Admin

   static create(
      props: Omit<TeamMemberProps, 'createdAt' | 'status' | 'updatedAt'>,
      createBy: Owner,
   ): Admin

   static create(
      props:
         | Optional<TeamMemberProps, 'createdAt' | 'status'>
         | TeamMemberProps,
      secondProp: UniqueEntityID | Owner,
   ) {
      if (secondProp instanceof UniqueEntityID) {
         return new Admin(props as TeamMemberProps, secondProp)
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

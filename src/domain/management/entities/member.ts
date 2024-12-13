import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Admin } from './admin'
import { Owner } from './owner'
import { TeamMember, TeamMemberProps } from './team-member'

import { TeamMemberCreatedEvent } from '../events/team-member-created.event'
import { TeamMemberRemovedEvent } from '../events/team-member-removed.event'
import { TeamMemberRoleUpdatedEvent } from '../events/team-member-role-updated.event'
import { TeamMemberAcceptedInvitationEvent } from '../events/team-member-accepted-invitation.event'

export class Member extends TeamMember {
   private __member = 'member'

   reinviteInactive(invitedBy: Owner | Admin) {
      this.addDomainEvent(new TeamMemberCreatedEvent(this, invitedBy))
   }

   acceptInvite() {
      this.props.status = 'ACTIVE'
      this.touch()

      this.addDomainEvent(new TeamMemberAcceptedInvitationEvent(this))
   }

   refuseInvite() {
      this.addDomainEvent(new TeamMemberAcceptedInvitationEvent(this))
   }

   remove(removedBy: TeamMember) {
      this.props.status = 'INACTIVE'
      this.touch()

      this.addDomainEvent(new TeamMemberRemovedEvent(this, removedBy))
   }

   setupUpdateRole() {
      this.touch()
      this.addDomainEvent(new TeamMemberRoleUpdatedEvent(this, 'ADMIN'))
   }

   static create(props: TeamMemberProps, id: UniqueEntityID): Member

   static create(
      props: Omit<TeamMemberProps, 'createdAt' | 'status' | 'updatedAt'>,
      createBy: Owner | Admin,
   ): Member

   static create(
      props: Omit<TeamMemberProps, 'createdAt' | 'status'> | TeamMemberProps,
      secondProp: UniqueEntityID | Owner | Admin,
   ) {
      if (secondProp instanceof UniqueEntityID) {
         return new Member(props as TeamMemberProps, secondProp)
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

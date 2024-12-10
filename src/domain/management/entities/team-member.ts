import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export type TeamMemberRole = 'ADMIN' | 'MEMBER' | 'OWNER'
export type TeamMemberStatus = 'INVITED' | 'ACTIVE' | 'INACTIVE'

export interface TeamMemberProps {
   status: TeamMemberStatus

   userId: UniqueEntityID
   teamId: UniqueEntityID

   createdAt: Date
   updatedAt?: Date | null
}

export abstract class TeamMember<
   T extends TeamMemberProps = TeamMemberProps,
> extends AggregateRoot<T> {
   get status() {
      return this.props.status
   }

   get userId() {
      return this.props.userId
   }

   get teamId() {
      return this.props.teamId
   }

   get createdAt() {
      return this.props.createdAt
   }

   get updatedAt() {
      return this.props.updatedAt
   }

   protected touch() {
      this.props.updatedAt = new Date()
   }

   abstract remove(removingBy: TeamMember): void
}

import { ValueObject } from '@/core/entities/value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task } from '../task'
import { TeamMemberRole, TeamMemberStatus } from '../team-member'

export interface TeamMemberDetailsProps {
   id: UniqueEntityID

   name: string
   email: string
   status: TeamMemberStatus
   role: TeamMemberRole

   userId: UniqueEntityID
   teamId: UniqueEntityID

   tasks: Task[]

   createdAt: Date
}

export class TeamMemberDetails extends ValueObject<TeamMemberDetailsProps> {
   get id() {
      return this.props.id
   }

   get name() {
      return this.props.name
   }

   get email() {
      return this.props.email
   }

   get status() {
      return this.props.status
   }

   get role() {
      return this.props.role
   }

   get userId() {
      return this.props.userId
   }

   get teamId() {
      return this.props.teamId
   }

   get tasks() {
      return this.props.tasks
   }

   get createdAt() {
      return this.props.createdAt
   }

   static create(props: TeamMemberDetailsProps) {
      return new TeamMemberDetails(props)
   }
}

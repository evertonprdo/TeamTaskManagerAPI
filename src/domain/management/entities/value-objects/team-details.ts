import { ValueObject } from '@/core/entities/value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TeamMemberWithName } from './team-member-with-name'
import { TaskWithAssignedTo } from './task-with-assigned-to'

export interface TeamDetailsProps {
   id: UniqueEntityID
   teamName: string
   description: string

   teamMembers: TeamMemberWithName[]
   tasks: TaskWithAssignedTo[]
}

export class TeamDetails extends ValueObject<TeamDetailsProps> {
   get id() {
      return this.props.id
   }

   get teamName() {
      return this.props.teamName
   }

   get description() {
      return this.props.description
   }

   get teamMembers() {
      return this.props.teamMembers
   }

   get tasks() {
      return this.props.tasks
   }

   static create(props: TeamDetailsProps) {
      return new TeamDetails(props)
   }
}

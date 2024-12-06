import { ValueObject } from '@/core/entities/value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task } from '../task'
import { TeamMemberWithName } from './team-member-with-name'

export interface TeamDetailsProps {
   id: UniqueEntityID
   teamName: string
   description: string

   ownerName: string
   ownerId: UniqueEntityID

   teamMembers: TeamMemberWithName[]
   tasks: Task[]
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

   get ownerName() {
      return this.props.ownerName
   }

   get ownerId() {
      return this.props.ownerId
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

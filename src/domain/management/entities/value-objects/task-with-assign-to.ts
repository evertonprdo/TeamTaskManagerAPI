import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TaskPriority, TaskStatus } from '../task'
import { TeamMemberWithName } from './team-member-with-name'
import { ValueObject } from '@/core/entities/value-object'

export interface TaskWithAssignToProps {
   id: string

   title: string
   description: string
   status: TaskStatus
   priority: TaskPriority

   assignedTo?: TeamMemberWithName
   teamId: UniqueEntityID

   createdAt: Date
   updatedAt?: Date | null
}

export class TaskWithAssignTo extends ValueObject<TaskWithAssignToProps> {
   get id() {
      return this.props.id
   }

   get title() {
      return this.props.title
   }

   get description() {
      return this.props.description
   }

   get status() {
      return this.props.status
   }

   get priority() {
      return this.props.priority
   }

   get assignedTo() {
      return this.props.assignedTo
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

   static create(props: TaskWithAssignToProps) {
      return new TaskWithAssignTo(props)
   }
}

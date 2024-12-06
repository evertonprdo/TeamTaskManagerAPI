import { Optional } from '@/core/types/optional'
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { TaskReassignedEvent } from '../events/task-reassigned.event'
import { TaskAction, TaskEvent } from '../events/task.event'
import { TaskStatusUpdatedEvent } from '../events/task-status-updated.event'

import { TeamMember } from './team-member'

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type TaskStatus = 'UNASSIGN' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface TaskProps {
   title: string
   description: string
   status: TaskStatus
   priority: TaskPriority

   assignedTo?: UniqueEntityID | null
   teamId: UniqueEntityID

   createdAt: Date
   updatedAt?: Date | null
}

export class Task extends AggregateRoot<TaskProps> {
   get title() {
      return this.props.title
   }

   set title(title: string) {
      this.props.title = title
      this.touch()
   }

   get description() {
      return this.props.description
   }

   set description(description: string) {
      this.props.description = description
      this.touch()
   }

   get status() {
      return this.props.status
   }

   get priority() {
      return this.props.priority
   }

   set priority(priority: TaskPriority) {
      this.props.priority = priority
      this.touch()
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

   private touch() {
      this.props.updatedAt = new Date()
   }

   start(changedBy: TeamMember) {
      const oldStatus = this.status

      this.props.status = 'IN_PROGRESS'
      this.touch()

      this.addDomainEvent(
         new TaskStatusUpdatedEvent(this, oldStatus, changedBy),
      )
   }

   complete(changedBy: TeamMember) {
      const oldStatus = this.status

      this.props.status = 'COMPLETED'
      this.touch()

      this.addDomainEvent(
         new TaskStatusUpdatedEvent(this, oldStatus, changedBy),
      )
   }

   assign(teamMemberId: UniqueEntityID) {
      if (this.props.assignedTo) {
         throw new Error()
      }

      this.props.status = 'PENDING'
      this.props.assignedTo = teamMemberId
      this.touch()

      this.addDomainEvent(new TaskEvent(this, TaskAction.ASSIGN))
   }

   reassign(teamMemberId: UniqueEntityID) {
      const oldTeamMemberId = this.props.assignedTo

      if (!oldTeamMemberId) {
         throw new Error()
      }

      this.props.assignedTo = teamMemberId
      this.touch()

      this.addDomainEvent(new TaskReassignedEvent(this, oldTeamMemberId))
   }

   static create(
      props: Optional<TaskProps, 'createdAt' | 'status' | 'assignedTo'>,
      id?: UniqueEntityID,
   ) {
      const { assignedTo, ...rest } = props
      const task = new Task(
         {
            ...rest,
            createdAt: rest.createdAt ?? new Date(),
            status: rest.status ?? 'UNASSIGN',
         },
         id,
      )

      const isNewTask = !id

      if (!isNewTask) {
         task.props.assignedTo = assignedTo
         return task
      }

      if (assignedTo) {
         task.assign(assignedTo)
      }

      task.addDomainEvent(new TaskEvent(task, TaskAction.CREATED))
      return task
   }
}

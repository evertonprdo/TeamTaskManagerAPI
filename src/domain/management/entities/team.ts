import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { Optional } from '@/core/types/optional'

import { TeamRemovedEvent } from '../events/team-removed.event'

export interface TeamProps {
   name: string
   description: string
   createdAt: Date
   updatedAt?: Date | null
}

export class Team extends AggregateRoot<TeamProps> {
   get name() {
      return this.props.name
   }

   set name(name: string) {
      this.props.name = name
      this.touch()
   }

   get description() {
      return this.props.description
   }

   set description(description: string) {
      this.props.description = description
      this.touch()
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

   setupToRemove(userIds: string[]) {
      this.addDomainEvent(new TeamRemovedEvent(this, userIds))
   }

   static create(props: Optional<TeamProps, 'createdAt'>, id?: UniqueEntityID) {
      const team = new Team(
         {
            ...props,
            createdAt: props.createdAt ?? new Date(),
         },
         id,
      )

      return team
   }
}

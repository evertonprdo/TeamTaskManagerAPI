import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Entity } from '@/core/entities/entity'

export interface MessageProps {
   title: string
   content: string
   createdAt: Date
}

export class Message extends Entity<MessageProps> {
   get title() {
      return this.props.title
   }

   get content() {
      return this.props.content
   }

   get createdAt() {
      return this.props.createdAt
   }

   static create(
      props: Optional<MessageProps, 'createdAt'>,
      id?: UniqueEntityID,
   ) {
      const notification = new Message(
         {
            ...props,
            createdAt: props.createdAt ?? new Date(),
         },
         id,
      )

      return notification
   }
}

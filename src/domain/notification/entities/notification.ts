import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'

export interface NotificationProps {
   recipientId: UniqueEntityID
   messageId: UniqueEntityID
   createdAt: Date
   readAt?: Date | null
}

export class Notification extends Entity<NotificationProps> {
   get recipientId() {
      return this.props.recipientId
   }

   get messageId() {
      return this.props.messageId
   }

   get createdAt() {
      return this.props.createdAt
   }

   get readAt() {
      return this.props.readAt
   }

   read() {
      this.props.readAt = new Date()
   }

   static create(
      props: Optional<NotificationProps, 'createdAt'>,
      id?: UniqueEntityID,
   ) {
      const notification = new Notification(
         {
            ...props,
            createdAt: props.createdAt ?? new Date(),
         },
         id,
      )

      return notification
   }
}

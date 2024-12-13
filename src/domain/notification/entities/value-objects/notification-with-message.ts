import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

interface NotificationWithMessageProps {
   recipientId: UniqueEntityID
   messageId: UniqueEntityID

   title: string
   content: string

   createdAt: Date
   readAt?: Date | null
}

export class NotificationWithMessage extends ValueObject<NotificationWithMessageProps> {
   get recipientId() {
      return this.props.recipientId
   }

   get messageId() {
      return this.props.messageId
   }

   get title() {
      return this.props.title
   }

   get content() {
      return this.props.content
   }

   get createdAt() {
      return this.props.createdAt
   }

   get readAt() {
      return this.props.readAt
   }

   static create(props: NotificationWithMessageProps) {
      return new NotificationWithMessage(props)
   }
}

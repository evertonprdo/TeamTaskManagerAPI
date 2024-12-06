import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'

export interface UserProps {
   name: string
   email: string
   password: string
   createdAt: Date
   updatedAt?: Date | null
}

export class User extends Entity<UserProps> {
   get name() {
      return this.props.name
   }

   set name(name: string) {
      this.props.name = name
      this.touch()
   }

   get email() {
      return this.props.email
   }

   set email(email: string) {
      this.props.email = email
      this.touch()
   }

   get password() {
      return this.props.password
   }

   set password(password: string) {
      this.props.password = password
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

   static create(props: Optional<UserProps, 'createdAt'>, id?: UniqueEntityID) {
      const user = new User(
         {
            ...props,
            createdAt: props.createdAt ?? new Date(),
         },
         id,
      )

      return user
   }
}

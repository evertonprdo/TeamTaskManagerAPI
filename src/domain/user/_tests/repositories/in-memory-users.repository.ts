import { User } from '@user/entities/user'
import { UsersRepository } from '@user/repositories/users.repository'

export class InMemoryUsersRepository implements UsersRepository {
   items: User[] = []

   async findById(id: string) {
      const user = this.items.find((item) => item.id.toString() === id)

      if (!user) {
         return null
      }

      return user
   }

   async findByEmail(email: string) {
      const user = this.items.find((item) => item.email === email)

      if (!user) {
         return null
      }

      return user
   }

   async create(user: User) {
      this.items.push(user)
   }

   async save(user: User) {
      const userIndex = this.items.findIndex((item) => item.id.equals(user.id))

      if (userIndex < 0) {
         throw new Error()
      }

      this.items[userIndex] = user
   }
}

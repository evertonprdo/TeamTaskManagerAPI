import { User } from '../../entities/user'
import { UsersRepository } from '../../repositories/users.repository'

export class InMemoryUsersRepository implements UsersRepository {
   public items: User[] = []

   async findByEmail(email: string) {
      const user = this.items.find((item) => item.email === email)

      if (!user) {
         return null
      }

      return user
   }

   async findById(id: string) {
      const user = this.items.find((item) => item.id.toString() === id)

      if (!user) {
         return null
      }

      return user
   }
}

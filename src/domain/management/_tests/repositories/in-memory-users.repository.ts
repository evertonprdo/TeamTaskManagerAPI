import { UsersRepository } from '../../repositories/users.repository'

import { InMemoryDatabase } from './in-memory-database'

const TABLE = 'users'

export class InMemoryUsersRepository implements UsersRepository {
   constructor(private db: InMemoryDatabase) {}

   async findByEmail(email: string) {
      const user = this.db[TABLE].find((item) => item.email === email)

      if (!user) {
         return null
      }

      return user
   }

   async findById(id: string) {
      const user = this.db[TABLE].find((item) => item.id.toString() === id)

      if (!user) {
         return null
      }

      return user
   }
}

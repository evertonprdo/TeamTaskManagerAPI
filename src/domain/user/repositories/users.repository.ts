import { User } from '../entities/user'

export interface UsersRepository {
   findById(id: string): Promise<null | User>
   findByEmail(email: string): Promise<null | User>

   create(user: User): Promise<void>
   save(user: User): Promise<void>
}

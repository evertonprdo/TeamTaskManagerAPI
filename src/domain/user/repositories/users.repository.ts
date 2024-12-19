import { User } from '../entities/user'

export abstract class UsersRepository {
   abstract findById(id: string): Promise<null | User>
   abstract findByEmail(email: string): Promise<null | User>

   abstract create(user: User): Promise<void>
   abstract save(user: User): Promise<void>
}

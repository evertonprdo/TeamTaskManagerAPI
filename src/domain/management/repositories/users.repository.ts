import { User } from '../entities/user'

export interface UsersRepository {
   findByEmail(email: string): Promise<User | null>
   findById(id: string): Promise<User | null>
}

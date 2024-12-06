import { Owner } from '../entities/owner'

export interface OwnersRepository {
   create(owner: Owner): Promise<void>
}

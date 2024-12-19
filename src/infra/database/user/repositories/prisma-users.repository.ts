import { Injectable } from '@nestjs/common'

import { User } from '@/domain/user/entities/user'
import { UsersRepository } from '@/domain/user/repositories/users.repository'

import { PrismaService } from '../../prisma.service'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
   constructor(private prisma: PrismaService) {}

   async findById(id: string): Promise<null | User> {
      throw new Error('Method not implemented.')
   }

   async findByEmail(email: string): Promise<null | User> {
      throw new Error('Method not implemented.')
   }

   async create(user: User): Promise<void> {
      throw new Error('Method not implemented.')
   }

   async save(user: User): Promise<void> {
      throw new Error('Method not implemented.')
   }
}

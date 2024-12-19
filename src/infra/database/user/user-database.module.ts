import { Module } from '@nestjs/common'

import { UsersRepository } from '@/domain/user/repositories/users.repository'
import { PrismaUsersRepository } from './repositories/prisma-users.repository'

@Module({
   providers: [{ provide: UsersRepository, useClass: PrismaUsersRepository }],
   exports: [UsersRepository],
})
export class UserDatabaseModule {}

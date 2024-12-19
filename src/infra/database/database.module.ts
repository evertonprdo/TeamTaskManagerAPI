import { Module } from '@nestjs/common'

import { PrismaService } from './prisma.service'
import { UserDatabaseModule } from './user/user-database.module'

@Module({
   imports: [UserDatabaseModule],
   providers: [PrismaService],
   exports: [PrismaService],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'

@Module({
   imports: [DatabaseModule, CryptographyModule],
})
export class HttpModule {}

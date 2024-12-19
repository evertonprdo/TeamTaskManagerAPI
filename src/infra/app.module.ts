import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { envSchema } from './env'
import { EnvService } from './env/env.service'

@Module({
   imports: [
      ConfigModule.forRoot({
         validate: (env) => envSchema.parse(env),
         isGlobal: true,
      }),
   ],
   providers: [EnvService],
})
export class AppModule {}

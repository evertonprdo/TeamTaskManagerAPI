import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'

@Module({
   imports: [
      JwtModule.registerAsync({
         imports: [EnvModule],
         inject: [EnvService],
         global: true,
         useFactory(config: EnvService) {
            const secret = config.get('JWT_SECRET')

            return {
               secret,
            }
         },
      }),
   ],
   providers: [EnvService],
})
export class AuthModule {}

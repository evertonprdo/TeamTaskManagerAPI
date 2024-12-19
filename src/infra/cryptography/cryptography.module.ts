import { Module } from '@nestjs/common'

import { Encrypter } from '@/domain/user/cryptography/encrypter'
import { HashCompare } from '@/domain/user/cryptography/hash-compare'
import { HashGenerator } from '@/domain/user/cryptography/hash-generator'

import { JwtEncrypter } from './jwt-encrypter'
import { BcryptHasher } from './bcrypt-hasher'

@Module({
   providers: [
      { provide: Encrypter, useClass: JwtEncrypter },
      { provide: HashCompare, useClass: BcryptHasher },
      { provide: HashGenerator, useClass: BcryptHasher },
   ],
   exports: [Encrypter],
})
export class CryptographyModule {}

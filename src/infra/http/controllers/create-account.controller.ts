import {
   Post,
   Body,
   HttpCode,
   Controller,
   ConflictException,
   BadRequestException,
} from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

import { UserAlreadyExistsError } from '@/domain/user/use-cases/errors/user-already-exists.error'
import { RegisterUserUseCase } from '@/domain/user/use-cases/register-user.use-case'

const createAccountBodySchema = z.object({
   name: z.string(),
   email: z.string().email(),
   password: z.string(),
})
type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createAccountBodySchema)

@Controller('/accounts')
export class CreateAccountController {
   constructor(private registerUser: RegisterUserUseCase) {}

   @Post()
   @HttpCode(201)
   async handle(@Body(bodyValidationPipe) body: CreateAccountBodySchema) {
      const { name, email, password } = body

      const result = await this.registerUser.execute({
         name,
         email,
         password,
      })

      if (result.isLeft()) {
         const error = result.value

         switch (error.constructor) {
            case UserAlreadyExistsError:
               throw new ConflictException(error.message)

            default:
               throw new BadRequestException(error.message)
         }
      }
   }
}

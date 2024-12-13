import { Either, right } from '@/core/either'

import { Owner } from '../entities/owner'
import { Admin } from '../entities/admin'
import { Member } from '../entities/member'

import { TeamMembersRepository } from '../repositories/team-members.repository'

interface PassOwnershipUseCaseRequest {
   owner: Owner
   passTo: Admin | Member
}

type PassOwnershipUseCaseResponse = Either<null, null>

export class PassOwnershipUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      owner,
      passTo,
   }: PassOwnershipUseCaseRequest): Promise<PassOwnershipUseCaseResponse> {
      owner.remove(passTo)
      await this.teamMembersRepository.removeOwner(owner)

      const teamMember = Owner.create(
         {
            teamId: passTo.teamId,
            userId: passTo.userId,
            createdAt: passTo.createdAt,
            status: passTo.status,
            updatedAt: passTo.updatedAt,
         },
         passTo.id,
      )

      await this.teamMembersRepository.save(teamMember)
      return right(null)
   }
}

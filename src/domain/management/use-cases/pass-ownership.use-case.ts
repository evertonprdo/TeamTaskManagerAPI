import { Either, left, right } from '@/core/either'

import { ForbiddenError } from '@/core/errors/forbidden.error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found.error'

import { Owner } from '../entities/owner'
import { TeamMembersRepository } from '../repositories/team-members.repository'

interface PassOwnershipUseCaseRequest {
   owner: Owner
   passToId: string
}

type PassOwnershipUseCaseResponse = Either<ResourceNotFoundError, null>

export class PassOwnershipUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      owner,
      passToId,
   }: PassOwnershipUseCaseRequest): Promise<PassOwnershipUseCaseResponse> {
      let teamMember = await this.teamMembersRepository.findById(passToId)

      if (!teamMember) {
         return left(new ResourceNotFoundError())
      }

      if (teamMember.status !== 'ACTIVE') {
         return left(new ForbiddenError())
      }

      owner.remove(teamMember)
      await this.teamMembersRepository.removeOwner(owner)

      teamMember = Owner.create(
         {
            teamId: teamMember.teamId,
            userId: teamMember.userId,
            createdAt: teamMember.createdAt,
            status: teamMember.status,
            updatedAt: teamMember.updatedAt,
         },
         teamMember.id,
      )

      await this.teamMembersRepository.save(teamMember)
      return right(null)
   }
}

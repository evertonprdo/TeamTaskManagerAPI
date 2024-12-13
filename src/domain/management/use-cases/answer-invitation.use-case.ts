import { Either, left, right } from '@/core/either'

import { InvitationAlreadyAnsweredError } from './errors/invitation-already-answered.error'

import { Admin } from '../entities/admin'
import { Member } from '../entities/member'

import { TeamMembersRepository } from '../repositories/team-members.repository'

interface AnswerInvitationUseCaseRequest {
   teamMember: Admin | Member
   isAnswerAccepted: boolean
}

type AnswerInvitationUseCaseResponse = Either<
   InvitationAlreadyAnsweredError,
   null | { teamMember: Admin | Member }
>

export class AnswerInvitationUseCase {
   constructor(private teamMembersRepository: TeamMembersRepository) {}

   async execute({
      isAnswerAccepted,
      teamMember,
   }: AnswerInvitationUseCaseRequest): Promise<AnswerInvitationUseCaseResponse> {
      if (teamMember.status !== 'INVITED') {
         return left(new InvitationAlreadyAnsweredError())
      }

      if (isAnswerAccepted) {
         return this.handleAcceptAnswer(teamMember)
      }

      return this.handleDeclinedAnswer(teamMember)
   }

   private async handleAcceptAnswer(
      teamMember: Admin | Member,
   ): Promise<AnswerInvitationUseCaseResponse> {
      teamMember.acceptInvite()
      await this.teamMembersRepository.save(teamMember)

      return right({ teamMember })
   }

   private async handleDeclinedAnswer(
      teamMember: Admin | Member,
   ): Promise<AnswerInvitationUseCaseResponse> {
      teamMember.refuseInvite()
      await this.teamMembersRepository.removeInvited(teamMember)

      return right(null)
   }
}

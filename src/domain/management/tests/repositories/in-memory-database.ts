import { User } from '../../entities/user'
import { Task } from '../../entities/task'
import { Team } from '../../entities/team'
import { TeamMember } from '../../entities/team-member'

export class InMemoryDatabase {
   public tasks: Task[] = []
   public teams: Team[] = []
   public users: User[] = []
   public team_members: TeamMember[] = []
}

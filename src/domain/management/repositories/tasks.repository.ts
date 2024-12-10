import { Task } from '../entities/task'

export interface TasksRepository {
   findManyByTeamId(id: string): Promise<Task[]>
   findById(id: string): Promise<null | Task>

   create(task: Task): Promise<void>
}

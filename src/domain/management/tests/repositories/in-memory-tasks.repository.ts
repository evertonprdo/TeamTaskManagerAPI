import { DomainEvents } from '@/core/events/domain-events'

import { Task } from '../../entities/task'
import { TasksRepository } from '../../repositories/tasks.repository'

export class InMemoryTasksRepository implements TasksRepository {
   public items: Task[] = []

   async findManyByTeamId(id: string): Promise<Task[]> {
      const tasks = this.items.filter((item) => item.teamId.toString() === id)

      return tasks
   }

   async findById(id: string): Promise<null | Task> {
      const task = this.items.find((item) => item.id.toString() === id)

      if (!task) {
         return null
      }

      return task
   }

   async create(task: Task): Promise<void> {
      this.items.push(task)

      DomainEvents.dispatchEventsForAggregate(task.id)
   }
}

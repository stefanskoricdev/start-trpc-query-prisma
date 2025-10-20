import { Card } from "@/components/ui/card";
import type { Task as TaskType } from "@/routes";
import { Task } from "./Task";

interface TaskListProps {
  tasks: TaskType[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No tasks yet. Add one to get started!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </div>
  );
}

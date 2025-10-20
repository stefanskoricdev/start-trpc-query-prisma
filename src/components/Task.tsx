import { useTRPC } from "@/trpc/react";
import { Tasks } from "@/trpc/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

export const Task = ({ task }: { task: Tasks[number] }) => {
  const trpc = useTRPC();

  const { refetch: refetchTasks } = useQuery({
    ...trpc.tasks.tasks.queryOptions(),
    enabled: false,
  });

  const { mutate: deleteTask, status: deleteStatus } = useMutation({
    ...trpc.tasks.delete.mutationOptions(),
    onSuccess: () => {
      refetchTasks();
    },
  });

  const { mutate: updateTask } = useMutation({
    ...trpc.tasks.update.mutationOptions(),
    onSuccess: () => {
      refetchTasks();
    },
  });

  const handleDeleteTask: React.MouseEventHandler = (e) => {
    e.preventDefault();
    deleteTask({ id: task.id });
    toast.success("Task deleted successfully");
  };

  const toggleTask = () => {
    updateTask({ ...task, completed: !task.completed });
  };
  return (
    <Card key={task.id} className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={toggleTask}
          className="cursor-pointer"
        />
        <Link
          to="/tasks/$taskID"
          params={{ taskID: task.id }}
          className="flex-1 min-w-0"
        >
          <h3
            className={`font-medium text-foreground ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground truncate">
              {task.description}
            </p>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteTask}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {deleteStatus === "pending" || deleteStatus === "success" ? (
            <Loader className="h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
};

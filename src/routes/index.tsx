"use client";

import { TaskSkeleton } from "@/components/TaskSkeleton";
import { TaskList } from "@/components/TasksList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createClientOnlyFn,
  createIsomorphicFn,
  createServerFn,
} from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import chalk from "chalk";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
}

// RPC: Server execution, callable from client and server too
const runServerFunc = createServerFn().handler(() => {
  console.log(chalk.blue("Only runs on server!"));
  return null;
});

//  Client-only, server crashes if called from server
const runClientFunc = createClientOnlyFn(() => {
  console.log(chalk.green("Only runs on client!"));
  return null;
});

// Different implementation per environment
const runIsomorphicFunc = createIsomorphicFn()
  .server(() => {
    console.log(chalk.blue(`Get server OS ==> ${process.platform}`));
  })
  .client(() => {
    console.log(chalk.green(`Get user browser ==> ${navigator.userAgent}`));
  });

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    runServerFunc();

    // Runs only server implementation
    runIsomorphicFunc();

    // Route loaders are isomorphic!!!
    console.log(chalk.yellow("Runs both on server and client!"));

    await context.queryClient.prefetchQuery(
      context.trpc.tasks.tasks.queryOptions()
    );
  },
  component: HomePage,
});

export default function HomePage() {
  const trpc = useTRPC();

  const { data: tasks, refetch: refetchTasks } = useQuery(
    trpc.tasks.tasks.queryOptions()
  );

  const { mutate: addTask } = useMutation({
    ...trpc.tasks.add.mutationOptions(),
    onSuccess: () => {
      refetchTasks();
      setNewTaskTitle("");
    },
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleSubmitNewTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const newTask = {
      title: newTaskTitle,
      description: "",
      completed: false,
      createdAt: new Date(),
    };

    addTask(newTask);

    toast.success("Task added successfully");
  };

  useEffect(() => {
    runClientFunc();

    // Runs only client implementation
    runIsomorphicFunc();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage your daily tasks and stay organized
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmitNewTask();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSubmitNewTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <TaskList tasks={tasks || []} />
      </div>
    </div>
  );
}

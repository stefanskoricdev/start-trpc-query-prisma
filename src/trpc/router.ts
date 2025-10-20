import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./init";

import type { TRPCRouterRecord } from "@trpc/server";
//import { readFile, writeFile } from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/db";

//const TASKS_FILE = "src/data/tasks.json";

const taskValidator = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  completed: z.boolean(),
  createdAt: z.date(),
});

const taskPartial = taskValidator.partial().extend({ id: z.string() });

/* function delay(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(true), ms));
} */

export type Task = z.infer<typeof taskValidator>;
export type Tasks = Array<Task & { id: string }>;
export type TaskPartial = z.infer<typeof taskPartial>;

const getTasks = async () => {
  // const tasks = await readFile(TASKS_FILE, "utf-8");
  // return JSON.parse(tasks) as Tasks;
  return await prisma.tasks.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getTask = async (id: string) => {
  // const tasks = await getTasks();
  // return tasks.find((t) => t.id === id);
  return await prisma.tasks.findUnique({
    where: {
      id,
    },
  });
};

const addNewTask = async (data: Task) => {
  const newTask = {
    id: uuidv4(),
    ...data,
  };

  // const allTasks = await getTasks();
  // await delay(1000);
  // await writeFile(TASKS_FILE, JSON.stringify([...allTasks, newTask]));

  // return newTask;

  return await prisma.tasks.create({
    data: newTask,
  });
};

const updateTask = async (data: TaskPartial) => {
  // const allTasks = await getTasks();

  // const taskToUpdateIdx = allTasks.findIndex((t) => t.id === data.id);

  // allTasks[taskToUpdateIdx] = {
  //   ...allTasks[taskToUpdateIdx],
  //   ...data,
  // };

  // await writeFile(TASKS_FILE, JSON.stringify(allTasks));

  return await prisma.tasks.update({
    where: {
      id: data.id,
    },
    data: {
      ...data,
    },
  });
};

const deleteTask = async (data: { id: string }) => {
  /* const allTasks = await getTasks();

  const newTasks = allTasks.filter((t) => t.id !== data.id);
  await delay(1000);
  await writeFile(TASKS_FILE, JSON.stringify(newTasks));

  return data.id; */
  return await prisma.tasks.delete({
    where: {
      id: data.id,
    },
  });
};

const tasksRouter = {
  tasks: publicProcedure.query(async () => await getTasks()),
  task: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async (ctx) => await getTask(ctx.input.id)),
  add: publicProcedure
    .input(taskValidator)
    .mutation(async (ctx) => await addNewTask(ctx.input)),
  update: publicProcedure
    .input(taskPartial)
    .mutation(async (ctx) => await updateTask(ctx.input)),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (ctx) => await deleteTask(ctx.input)),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
  tasks: tasksRouter,
});

export type TRPCRouter = typeof trpcRouter;

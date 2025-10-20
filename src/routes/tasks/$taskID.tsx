import { useState } from "react";

import { ArrowLeft, Trash2, Save, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks/$taskID")({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.tasks.task.queryOptions({ id: params.taskID })
    );
  },
  component: TaskPage,
});

export default function TaskPage() {
  const trpc = useTRPC();
  const { taskID } = Route.useParams();

  const navigate = useNavigate();
  const navigateHome = () => {
    navigate({ to: "/" });
  };

  const { data: task, refetch: refetchTask } = useQuery(
    trpc.tasks.task.queryOptions({ id: taskID })
  );
  const { refetch: refetchTasks } = useQuery({
    ...trpc.tasks.tasks.queryOptions(),
    enabled: false,
  });

  const { mutate: deleteTask, status: deleteStatus } = useMutation({
    ...trpc.tasks.delete.mutationOptions(),
    onSuccess: async () => {
      await refetchTasks();
      navigateHome();
    },
  });

  const { mutate: updateTask, isPending: isUpdateTaskPending } = useMutation({
    ...trpc.tasks.update.mutationOptions(),
    onSuccess: () => {
      refetchTask();
      toast.success("Changes saved!");
    },
  });

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [completed, setCompleted] = useState(task?.completed || false);

  const handleSave = () => {
    updateTask({
      id: taskID,
      title,
      description,
      completed,
    });
  };

  const handleDelete = () => {
    deleteTask({ id: taskID });
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Task not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" onClick={navigateHome} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Edit Task</h1>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                disabled={isUpdateTaskPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={5}
                disabled={isUpdateTaskPending}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={completed}
                onCheckedChange={(checked) => setCompleted(checked as boolean)}
                disabled={isUpdateTaskPending}
              />
              <Label htmlFor="completed" className="cursor-pointer">
                Mark as completed
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={isUpdateTaskPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isUpdateTaskPending}
              >
                {deleteStatus === "pending" || deleteStatus === "success" ? (
                  <Loader className="h-4 w-4 mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

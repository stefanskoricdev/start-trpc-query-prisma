import { Card } from "./ui/card";

export const TaskSkeleton = () => {
  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-neutral-300 rounded-sm" />
        <div className="flex-1 min-w-0">
          <div className="w-[100px] h-6 bg-neutral-300 rounded-sm" />
          <div className="w-[500px] h-5 bg-neutral-300 rounded-sm mt-1" />
        </div>
        <div className="w-4 h-4 mx-2.5 bg-neutral-300 rounded-sm" />
      </div>
    </Card>
  );
};

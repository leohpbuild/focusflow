
"use client";

import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Star } from "lucide-react"; 
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void; 
}

export default function TaskItem({ task, onToggleComplete, onDelete, onToggleStar }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors duration-150">
      <div className="flex items-center gap-3 flex-grow">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
        />
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            "text-sm cursor-pointer transition-all flex-grow", 
            task.completed ? "line-through text-muted-foreground" : "text-foreground"
          )}
        >
          {task.text}
        </label>
      </div>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleStar(task.id)}
          aria-label={task.starred ? "Unstar task" : "Star task"}
          className={cn(
            "text-muted-foreground hover:text-yellow-500", 
            task.starred && "text-yellow-400 hover:text-yellow-500" 
          )}
        >
          <Star className={cn("h-4 w-4", task.starred && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

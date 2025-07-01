
"use client";

import type { Task } from "@/types";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export default function TaskList({ tasks, onToggleComplete, onDelete, onToggleStar }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No tasks yet. Add one above!</p>;
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    
    if (a.starred !== b.starred) {
      return a.starred ? -1 : 1;
    }
    
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="space-y-1 mt-2">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
        />
      ))}
    </div>
  );
}

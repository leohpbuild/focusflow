
"use client";

import {useState,useCallback,useEffect} from 'react';
import type {Task} from '@/types';
import useTasksAPI from '@/hooks/useTasksAPI';
// import useLocalStorage from '@/hooks/useLocalStorage';
import AddTaskForm from '@/components/focusflow/AddTaskForm';
import TaskList from '@/components/focusflow/TaskList';
import PomodoroTimer from '@/components/focusflow/PomodoroTimer';
import QuoteOfTheDay from '@/components/focusflow/QuoteOfTheDay';
import {Card,CardContent,CardHeader,CardTitle} from '@/components/ui/card';
import {Focus as AppIcon} from 'lucide-react';


export default function Home() {
  // const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow-tasks', []);
  const {tasks,loading,error,addTask: apiAddTask,updateTask,deleteTask: apiDeleteTask}=useTasksAPI();
  const [quoteRefreshKey,setQuoteRefreshKey]=useState(0);
  const handleAddTask=useCallback((text: string) => {
    apiAddTask(text);
  },[apiAddTask]);

  // const addTask=useCallback((text: string) => {
  //   const newTask: Task={
  //     id: crypto.randomUUID(),
  //     text,
  //     completed: false,
  //     createdAt: Date.now(),
  //     starred: false,
  //   };
  //   setTasks(prevTasks => [newTask,...prevTasks]);
  // },[setTasks]);
  const toggleTaskCompletion=useCallback((id: string) => {
    const task=tasks.find(t => t.id===id);
    if(task) {
      updateTask(id,{completed: !task.completed});
    }
  },[tasks,updateTask]);
  // const toggleTaskCompletion=useCallback((id: string) => {
  //   setTasks(prevTasks =>
  //     prevTasks.map(task =>
  //       task.id===id? {...task,completed: !task.completed}:task
  //     )
  //   );
  // },[setTasks]);
  const toggleTaskStar=useCallback((id: string) => {
    const task=tasks.find(t => t.id===id);
    if(task) {
      updateTask(id,{starred: !task.starred});
    }
  },[tasks,updateTask]);
  // const toggleTaskStar=useCallback((id: string) => {
  //   setTasks(prevTasks =>
  //     prevTasks.map(task =>
  //       task.id===id? {...task,starred: !task.starred}:task
  //     )
  //   );
  // },[setTasks]);
  const handleDeleteTask=useCallback((id: string) => {
    apiDeleteTask(id);
  },[apiDeleteTask]);
  // const deleteTask=useCallback((id: string) => {
  //   setTasks(prevTasks => prevTasks.filter(task => task.id!==id));
  // },[setTasks]);

  const handleWorkSessionStart=useCallback(() => {
    setQuoteRefreshKey(prevKey => prevKey+1);
  },[]);


  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 flex flex-col items-center font-body">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center text-primary">
          <AppIcon size={40} className="mr-2" />
          <h1 className="text-4xl sm:text-5xl font-headline font-bold">
            FocusFlow
          </h1>
        </div>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">Your sanctuary for productivity and peace.</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle className="font-headline text-2xl text-primary">My Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <AddTaskForm onAddTask={handleAddTask} />
            {loading&&<p className="text-center text-muted-foreground py-4">Loading tasks...</p>}
            {error&&<p className="text-center text-destructive py-4">{error}</p>}

            {/* <AddTaskForm onAddTask={addTask} /> */}
            {!loading&&!error&&(
              <TaskList
                tasks={tasks}
                onToggleComplete={toggleTaskCompletion}
                onDelete={handleDeleteTask}
                onToggleStar={toggleTaskStar}
              />
            )}
            {/* <TaskList
              tasks={tasks}
              onToggleComplete={toggleTaskCompletion}
              onDelete={deleteTask}
              onToggleStar={toggleTaskStar}
            /> */}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <PomodoroTimer onWorkSessionStart={handleWorkSessionStart} />

          <QuoteOfTheDay key={quoteRefreshKey} />

        </div>
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FocusFlow. Crafted for concentration.</p>
      </footer>
    </div>
  );
}


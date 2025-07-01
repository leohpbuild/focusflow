"use client";

import {useState,useEffect,useCallback} from 'react';
import type {Task} from '@/types';

const API_URL='http://127.0.0.1:5000/tasks';
// const API_URL='/tasks';

export default function useTasksAPI() {
  const [tasks,setTasks]=useState<Task[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  const fetchTasks=useCallback(async () => {
    try {
      const response=await fetch(API_URL);
      if(!response.ok) throw new Error('Failed to fetch tasks');
      const data=await response.json();
      setTasks(data);
      setError(null);
    } catch(err) {
      setError(err instanceof Error? err.message:'Unknown error');
    } finally {
      setLoading(false);
    }
  },[]);

  const addTask=useCallback(async (text: string) => {
    try {
      const response=await fetch(API_URL,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text})
      });
      if(!response.ok) throw new Error('Failed to add task');
      const newTask=await response.json();
      setTasks(prev => [newTask,...prev]);
    } catch(err) {
      setError(err instanceof Error? err.message:'Failed to add task');
    }
  },[]);

  const updateTask=useCallback(async (id: string,updates: Partial<Task>) => {
    try {
      const response=await fetch(`${API_URL}/${id}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates)
      });
      if(!response.ok) throw new Error('Failed to update task');
      const updatedTask=await response.json();
      setTasks(prev => prev.map(task => task.id===id? updatedTask:task));
    } catch(err) {
      setError(err instanceof Error? err.message:'Failed to update task');
    }
  },[]);

  const deleteTask=useCallback(async (id: string) => {
    try {
      const response=await fetch(`${API_URL}/${id}`,{
        method: 'DELETE'
      });
      if(!response.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(task => task.id!==id));
    } catch(err) {
      setError(err instanceof Error? err.message:'Failed to delete task');
    }
  },[]);

  useEffect(() => {
    fetchTasks();
  },[fetchTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask
  };
}
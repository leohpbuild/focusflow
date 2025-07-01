
"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getValueFromLocalStorage<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    setValue(getValueFromLocalStorage(key, initialValue));
  
  }, [key]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      
      
      const currentValueInLocalStorage = window.localStorage.getItem(key);
      const stringifiedValue = JSON.stringify(value);
      if (currentValueInLocalStorage !== stringifiedValue) {
        try {
          window.localStorage.setItem(key, stringifiedValue);
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
      }
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;

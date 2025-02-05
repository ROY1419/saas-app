"use client"

import { Todo } from '@prisma/client';
import { CheckCircle, Trash2, XCircle } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
interface TodoItemProps {
    todo: Todo;
    isAdmin?: boolean;
    onUpdate: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
}

export function TodoItem({
    todo,
    isAdmin = false,
    onUpdate,
    onDelete
}: TodoItemProps) {
    const [isCompleted, setIsCompleted] = useState(todo.completed)
    const toggleComplete = async () => {
        const newCompletedState = !isCompleted;
        setIsCompleted(newCompletedState)
        onUpdate(todo.id, newCompletedState)
    }
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-4">
                <span className={isCompleted ? "line-through" : ""}>{todo.title}</span>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleComplete}>
                        {isCompleted ? (
                            <XCircle className="mr-2 h-4 w-4" />
                        ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        {isCompleted ? "Undo" : "Complete"}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(todo.id)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                    {isAdmin && (
                        <span className="ml-2 text-sm text-muted-foreground">
                            User ID: {todo.userId}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

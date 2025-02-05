"use client"

import React, { useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';

interface TodoFormProps {
    onSubmit: (title: string) => void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
    const [title, setTitle] = useState("")
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (title.trim()) {
            onSubmit(title.trim())
            setTitle("")
        }
    }
    return (
        <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
            <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a new todo"
                className="flex-grow"
                required
            />
            <Button type="submit" variant="outline">
                Add Todo
            </Button>
        </form>
    )
}


"use client"
import { Alert, AlertDescription } from '@/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { useUser } from '@clerk/nextjs'
import { Todo } from '@prisma/client'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'

export default function Dashboard() {
    const { user } = useUser()
    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncesearchTerm] = useDebounceValue(searchTerm, 300)
    const [isLoading, setIsLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const fetchTodos = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/todos?page=${page}&search=${debouncesearchTerm}`)
            if (!response.ok) {
                throw new Error("Failed to fetch todos")
            }
            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.tottalPages);
            setCurrentPage(data.currentPage)
            setIsLoading(false)
        } catch (err) {
            setIsLoading(false)
        }
    }, [debouncesearchTerm])
    useEffect(() => {
        fetchTodos(1)
        fetchSubscriptionStatus()
    }, [])
    const fetchSubscriptionStatus = async () => {
        const response = await fetch(`/api/subcription`)
        if (response.ok) {
            const data = await response.json()
            setIsSubscribed(data.isSubscribed);
        }
    }
    const handleAddTodo = async (title: string) => {
        try {
            const response = await fetch(`/api/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title
                })
            })
            if (!response.ok) {
                throw new Error("failed to add todo");
            }
            await fetchTodos(currentPage)
        } catch (err) {
            console.log(err);

        }
    }
    const handleUpdatetodo = async (id: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ completed })
            });
            if (!response.ok) {
                throw new Error("failed to update todo");
            }
            await fetchTodos(currentPage);
        } catch (err) {

        }
    }
    const handleDeleteTodo = async (id: string) => {
        const response = await fetch(`/api/todos/${id}`, { method: "DELETE" })
        if (!response.ok) {
            throw new Error("failed to delete todo");
            await fetchTodos(currentPage);
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl mb-8">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Welcome, {user?.emailAddresses[0].emailAddress}!
            </h1>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Todo</CardTitle>
                </CardHeader>
                <CardContent>
                    <TodoForm onSubmit={(title: string) => handleAddTodo(title)} />
                </CardContent>
            </Card>
            {!isSubscribed && todos.length >= 3 && (
                <Alert variant="destructive" className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You&apos;ve reached the maximum number of free todos.{" "}
                        <Link href="/subscribe" className="font-medium underline">
                            Subscribe now
                        </Link>{" "}
                        to add more.
                    </AlertDescription>
                </Alert>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Your Todos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        type="text"
                        placeholder="Search todos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />
                    {isLoading ? (
                        <p className="text-center text-muted-foreground">
                            Loading your todos...
                        </p>
                    ) : todos.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            You don&apos;t have any todos yet. Add one above!
                        </p>
                    ) : (
                        <>
                            <ul className="space-y-4">
                                {todos.map((todo: Todo) => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        onUpdate={handleUpdatetodo}
                                        onDelete={handleDeleteTodo}
                                    />
                                ))}
                            </ul>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page: number) => fetchTodos(page)}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
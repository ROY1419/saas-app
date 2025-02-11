import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/dist/types/server";

export async function DELETE(req: NextRequest,
    { params }: { params: { id: string } }) {
    const {userId}  = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 400 })
    }
    try {
        const todoId = params.id
        const todo = await prisma.todo.findUnique({
            where: { id: todoId }
        });
        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 400 })
        }
        if (todo.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 400 })
        }

        await prisma.todo.delete({
            where: { id: todoId }
        })
        return NextResponse.json({ message: "Todo deleted successfully" }, { status: 400 })
    } catch (err) {
        return NextResponse.json(
            { error: "Internal Server Error", err },
            { status: 500 }
        );
    }
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const {userId} = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 400 })
    }
    try {
        const { completed } = await req.json();
        const todoId = params.id;
        const todo = await prisma.todo.findUnique({
            where: { id: todoId }
        });
        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 400 })
        };
        if (todo.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 400 })
        };
        const updateTodo =  await prisma.todo.update({
            where: { id: todoId },
            data: { completed },
        })
        return NextResponse.json(updateTodo)
    } catch (err) {
        return NextResponse.json(
            { error: "Internal Server Error", err },
            { status: 500 }
        );
    }
}
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        const subscriptionEnds = new Date();
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isSubscribed: true,
                subscriptionEnds,
            },
        });

        return NextResponse.json({
            message: "Subscription successfully updated",
            subscriptionEnds: updatedUser.subscriptionEnds,
        });
    } catch (err) {
        console.error("Error updating subscription:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                isSubscribed: true,
                subscriptionEnds: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        const now = new Date();
        if (user.subscriptionEnds && user.subscriptionEnds < now) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isSubscribed: false,
                    subscriptionEnds: null,
                },
            });

            return NextResponse.json({
                isSubscribed: false,
                subscriptionEnds: null,
            });
        }

        return NextResponse.json({
            isSubscribed: user.isSubscribed,
            subscriptionEnds: user.subscriptionEnds,
        });
    } catch (err) {
        console.error("Error fetching subscription status:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

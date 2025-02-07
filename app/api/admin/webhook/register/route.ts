import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/dist/types/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        throw new Error("Add webhook secret in env");
    }
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occured = no svix Header");
    }
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook", err);
        return new Response("Error occured", { status: 400 });
    }
    const { id } = evt.data;
    const eventType = evt.type;
    //logs
    if (eventType === "user.created") {
        try {
            const { email_addresses, primary_email_address_id } = evt.data;
            // log practise
            const primaryEmail = email_addresses.find(
                (email) => email.id === primary_email_address_id
            );
            if (!primaryEmail) {
                return new Response("No Primary eamil found", { status: 400 });
            }
            const newUser = await prisma.user.create({
                data: {
                    id: evt.data.id,
                    email: primaryEmail.email_address,
                    isSubscribed: false,
                },
            });
            console.log("New User Created");
        } catch (err) {
            console.error("Error creating user in database:", err);
            return new Response("Error creating user", { status: 400 });
        }
    }
    return new Response("Webhook received successfully", { status: 200 });
}

// 106.213.138.45

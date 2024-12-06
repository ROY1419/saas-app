import { PrismaClient } from "@prisma/client";

const prismaClientSing = () => {
    return new PrismaClient()
}
type prismaClientSing = ReturnType<typeof prismaClientSing>
const globalForPrisma = globalThis as unknown as { prisma : PrismaClient | undefined};
const prisma = globalForPrisma.prisma ?? prismaClientSing();
if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma
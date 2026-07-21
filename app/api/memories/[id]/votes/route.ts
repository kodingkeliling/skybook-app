import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const memoryId = params.id;
    const votes = await prisma.vote.findMany({
        where: { memoryId }
    });

    // group by candidate
    const candidatesMap: Record<string, string[]> = {};
    for (const v of votes) {
        if (!candidatesMap[v.candidateName]) {
            candidatesMap[v.candidateName] = [];
        }
        candidatesMap[v.candidateName].push(v.voterName);
    }
    const result = Object.keys(candidatesMap).map(candidate => ({
        candidateName: candidate,
        count: candidatesMap[candidate].length,
        voters: candidatesMap[candidate]
    }));
    return NextResponse.json(result);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const memoryId = params.id;
    const { voterName, candidateName } = await req.json();

    const existing = await prisma.vote.findFirst({
        where: { memoryId, voterName }
    });

    if (existing) {
        if (existing.candidateName === candidateName) {
            await prisma.vote.delete({ where: { id: existing.id } });
        } else {
            await prisma.vote.update({
                where: { id: existing.id },
                data: { candidateName }
            });
        }
    } else {
        await prisma.vote.create({
            data: {
                memoryId,
                voterName,
                candidateName
            }
        });
    }

    return NextResponse.json({ success: true });
}

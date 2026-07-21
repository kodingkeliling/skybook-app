import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const memoryId = params.id;

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(`event: connected\ndata: ok\n\n`));

            let isClosed = false;

            req.signal.addEventListener("abort", () => {
                isClosed = true;
            });

            while (!isClosed) {
                try {
                    const votes = await prisma.vote.findMany({
                        where: { memoryId }
                    });

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

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(result)}\n\n`)
                    );

                    await new Promise((resolve) => setTimeout(resolve, 2000));
                } catch (err) {
                    controller.error(err);
                    break;
                }
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive"
        }
    });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "";
        const content = typeof body.content === "string" ? body.content.trim() : "";

        if (!authorName) {
            return NextResponse.json({ error: "Author name is required" }, { status: 400 });
        }

        if (!content) {
            return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                memoryId: id,
                authorName,
                content,
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Create Comment Error:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}

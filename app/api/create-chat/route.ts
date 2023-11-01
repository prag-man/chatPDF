import { db } from "@/lib/db";
import { loadFirebaseIntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { chats } from "@/lib/db/schema";

export async function POST(req: Request, res: Response){
    const {userId} = await auth()
    if(!userId){
        return NextResponse.json({ error: "unauthorized"}, {status: 401})
    }
    try{
        const body = await req.json()
        const {file_key, file_name} = body
        await loadFirebaseIntoPinecone(file_key)
        const chat_id = await db.insert(chats).values({
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: file_key,
            userId: userId
        }).returning({
            insertedId: chats.id
        })

        return NextResponse.json({
            chat_id: chat_id[0].insertedId
        }, { status: 200 })

    }catch(error){
        console.error(error);
        return NextResponse.json(
            {error:"Internal server error"},
            {status: 500}
        )
    }
}
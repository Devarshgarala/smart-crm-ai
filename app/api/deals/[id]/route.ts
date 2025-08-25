import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { embedAndUpsertDeal } from "@/lib/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const prisma = new PrismaClient();
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index(process.env.PINECONE_INDEX!);

// UPDATE deal
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const deal = await prisma.deal.update({
    where: { id: params.id },
    data: {
      title: body.title,
      value: body.value,
      stage: body.stage,
    },
  });

  // update Pinecone
  await embedAndUpsertDeal(deal);

  return NextResponse.json(deal);
}

// DELETE deal
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // remove from DB
  const deal = await prisma.deal.delete({
    where: { id: params.id },
  });

  // remove from Pinecone
  await index.deleteOne(deal.id);

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { embedAndUpsertDeal, deleteDealFromPinecone } from "@/lib/pinecone";

const prisma = new PrismaClient();

// UPDATE deal
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const deal = await prisma.deal.update({
    where: { id: params.id },
    data: {
      title: body.title,
      value: body.value,
      stage: body.stage,
    },
  });

  // update in Pinecone
  await embedAndUpsertDeal(deal);

  return NextResponse.json(deal);
}

// DELETE deal
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.deal.delete({
    where: { id: params.id },
  });

  // remove from Pinecone
  await deleteDealFromPinecone(params.id);

  return NextResponse.json({ message: "Deleted successfully" });
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { embedAndUpsertDeal } from "@/lib/pinecone";

const prisma = new PrismaClient();

// POST -> create new deal
export async function POST(req: Request) {
  const body = await req.json();

  const deal = await prisma.deal.create({
    data: {
      title: body.title,
      value: body.value,
      stage: body.stage,
    },
  });

  // also push to Pinecone
  await embedAndUpsertDeal(deal);

  return NextResponse.json(deal);
}

// GET -> fetch all deals
export async function GET() {
  const deals = await prisma.deal.findMany();
  return NextResponse.json(deals);
}

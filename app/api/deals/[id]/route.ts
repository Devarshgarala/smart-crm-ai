// app/api/deals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { embedAndUpsertDeal, deleteDealFromPinecone } from "@/lib/pinecone";

const prisma = new PrismaClient();

// UPDATE deal
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<'/api/deals/[id]'>
) {
  const { id } = await ctx.params; // 👈 params is async in Next 15
  try {
    const body = await req.json();

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        title: body.title,
        value: body.value,
        stage: body.stage,
      },
    });

    await embedAndUpsertDeal(deal);
    return NextResponse.json(deal, { status: 200 });
  } catch (error) {
    console.error("Error updating deal:", error);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

// DELETE deal
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/deals/[id]'>
) {
  const { id } = await ctx.params; // 👈 await here too
  try {
    await prisma.deal.delete({ where: { id } });
    await deleteDealFromPinecone(id);
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}

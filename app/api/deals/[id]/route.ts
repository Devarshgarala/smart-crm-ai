import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { embedAndUpsertDeal, deleteDealFromPinecone } from "@/lib/pinecone";

const prisma = new PrismaClient();

// UPDATE deal
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const deal = await prisma.deal.update({
      where: { id: params.id }, // cuid() = string
      data: {
        title: body.title,
        value: body.value,
        stage: body.stage,
      },
    });

    // update in Pinecone
    await embedAndUpsertDeal(deal);

    return NextResponse.json(deal, { status: 200 });
  } catch (error) {
    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

// DELETE deal
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.deal.delete({
      where: { id: params.id },
    });

    // remove from Pinecone
    await deleteDealFromPinecone(params.id);

    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}

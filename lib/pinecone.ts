import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables");
}
if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing PINECONE_API_KEY in environment variables");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! }); // non-null assertion

const index = pc.index("deals-index"); // use your Pinecone index name

// Create embeddings and upsert to Pinecone
export async function embedAndUpsertDeal(deal: any) {
  const text = `${deal.title} ${deal.stage} ${deal.value}`;
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  await index.upsert([
    {
      id: deal.id,
      values: embedding.data[0].embedding,
      metadata: {
        title: deal.title,
        stage: deal.stage,
        value: deal.value.toString(),
      },
    },
  ]);
}

// Delete from Pinecone
export async function deleteDealFromPinecone(id: string) {
  await index.deleteOne(id);
}

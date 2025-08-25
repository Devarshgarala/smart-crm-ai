import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = client.index(process.env.PINECONE_INDEX!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function embedAndUpsertDeal(deal: { id: string; title: string; value: number; stage: string }) {
  // create text for embedding
  const text = `Deal: ${deal.title}, Value: ${deal.value}, Stage: ${deal.stage}`;

  // generate embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  // upsert into Pinecone
  await index.upsert([
    {
      id: deal.id,
      values: embedding.data[0].embedding,
      metadata: {
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
      },
    },
  ]);
}

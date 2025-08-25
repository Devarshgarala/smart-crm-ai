import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index(process.env.PINECONE_INDEX!);

export async function POST(req: Request) {
  const { question } = await req.json();

  // Step 1: Embed question
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  const vector = embeddingRes.data[0].embedding;

  // Step 2: Query Pinecone
  const results = await index.query({
    vector,
    topK: 3,
    includeMetadata: true,
  });

  // Step 3: Build context from Pinecone results
  const context = results.matches
    .map((match) => match.metadata?.title || "")
    .join("\n");

  // Step 4: Ask OpenAI with context
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful CRM assistant." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
    ],
  });

  const answer = completion.choices[0].message.content;

  return NextResponse.json({ answer });
}

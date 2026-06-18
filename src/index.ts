import Groq from "groq-sdk";
import { embeddings } from "./embeddings";
import { initStore } from "./pinecone";
import { prepareDocs } from "./prepare";

const FILEPATH = "blogs.pdf";

async function main() {
  const docs = await prepareDocs(FILEPATH);

  const store = await initStore(embeddings);

  // try {
  //   await store.addDocuments(docs);
  //   console.log("Indexing...");
  // } catch (err) {
  //   console.error("Error while indexing\n", err);
  // }

  const retriever = store.asRetriever(5);

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  while (true) {
    let input = prompt("User: ");
    if (input === "bye" || !input) {
      console.log("Assistant: bye");
      break;
    }

    const context = (await retriever.invoke(input))
      .map((doc) => doc.pageContent)
      .join("\n\n");

    const userPromptWithContext = `
    Answer the question using only the provided context.

    Context:
    ${context}

    Question:
    ${input}
    `;
    messages.push({
      role: "user",
      content: userPromptWithContext,
    });

    let response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
    });

    const reply = response.choices[0]?.message.content;

    messages.push({
      role: "assistant",
      content: reply,
    });

    console.log("Assistant: ", reply);
  }
}

main();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function prepareDocs(filePath: string) {
  // Load docs
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  // Chunk docs
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap:100 })
  const texts = await splitter.splitDocuments(docs)

  return texts
}

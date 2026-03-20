import { draftMode } from "next/headers";
import BooksClient from "../components/BooksClient";
import { getAllBooks } from "@/lib/api";

export default async function BooksPage() {
  const { isEnabled } = await draftMode();
  const allBooks = await getAllBooks(isEnabled);
  
  return (
    <div className="container mx-auto px-5 pt-10">
      <h1 className="text-6xl font-bold mb-10">Library</h1>
      <BooksClient initialBooks={allBooks} />
    </div>
  );
}

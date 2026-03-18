import BooksClient from "../components/BooksClient";

export default function BooksPage() {
  return (
    <div className="container mx-auto px-5 pt-10">
      <h1 className="text-6xl font-bold mb-10">Library</h1>
      <BooksClient />
    </div>
  );
}

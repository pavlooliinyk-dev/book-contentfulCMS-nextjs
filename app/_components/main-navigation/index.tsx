import Link from "next/link";

export default function MainNavigation() {
  return (
    <nav aria-label="Main navigation" className="my-8">
      <ul className="flex gap-6 list-none">
        <li>
          <Link 
            href="/books"
            className="text-blue-700 hover:text-blue-900 hover:underline transition-colors font-medium"
          >
            Books
          </Link>
        </li>
        <li>
          <Link 
            href="/movies"
            className="text-blue-700 hover:text-blue-900 hover:underline transition-colors font-medium"
          >
            Movies
          </Link>
        </li>
      </ul>
    </nav>
  );
}

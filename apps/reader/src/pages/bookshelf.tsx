import { Book } from "../components/book";
import royalroad from "../../royalroad.json";

type Book = {
  title: string;
  author: string;
  color: string;
  textColor: string;
  id: string;
  slug: string;
  pages: number;
};

export const BookshelfPage = () => {
  const pagesPerShelf = 2500;
  const shelves: Book[][] = [];
  let currentShelf: Book[] = [];
  let currentPageCount = 0;
  let totalPageCount = 0;
  for (const book of royalroad) {
    const pages = Math.max(Math.round(book.pages / 20), 40);
    if (currentPageCount + pages > pagesPerShelf) {
      shelves.push(currentShelf);
      currentShelf = [];
      currentPageCount = 0;
    }

    currentShelf.push(book);
    currentPageCount += pages;
    totalPageCount += book.pages;
  }

  return (
    <div
      style={{
        margin: "0 auto",
        width: "1440px",
      }}
    >
      {shelves.map((shelf) => {
        return (
          <div className="shelf">
            <div className="shelf-contents">
              {shelf.map((book) => (
                <Book
                  key={book.title}
                  title={book.title}
                  author={book.author}
                  spineColor={book.color}
                  spineTextColor={book.textColor}
                  image={`${book.id}-${book.slug}.jpg`}
                  pages={book.pages}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div>
        <h1 style={{ textAlign: "center" }}>
          {shelves.length} shelves, {totalPageCount} pages, takes{" "}
          {Math.round(totalPageCount / 50)}h to read
        </h1>
      </div>
    </div>
  );
};

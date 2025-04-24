import Link from "next/link";

function NotFound() {
  return (
    <html>
      <body>
        <div>
          <h2>Not Found</h2>
          <p>Could not find requested resource</p>
          <Link href="/">Home</Link>
        </div>
      </body>
    </html>
  );
}

export default NotFound;

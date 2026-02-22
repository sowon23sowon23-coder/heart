import "./globals.css";
import TopNav from "../components/TopNav";

export const metadata = {
  title: "Heart Flip Gallery",
  description: "Heart Flip Gallery",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <TopNav>{children}</TopNav>
      </body>
    </html>
  );
}

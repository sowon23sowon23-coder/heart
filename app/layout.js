import "./globals.css";

export const metadata = {
  title: "Heart Flip Gallery",
  description: "Heart Flip Gallery",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

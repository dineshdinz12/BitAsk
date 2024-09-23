import "./globals.css";

export const metadata = {
  title: "BitAsk",
  description: "A chatbot of BITSATHY",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}
      </body>
    </html>
  );
}

import Chatbot from "@/components/Chatbot";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Chatbot /> {/* Chatbot on all pages */}
      </body>
    </html>
  );
}

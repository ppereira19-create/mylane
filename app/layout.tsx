import "./globals.css";
import UserMenu  from "./components/UserMenu";

export const metadata = {
  title: "MyLane",
  description: "Transporte premium MyLane",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-black text-black relative">
        {/* Bolinha global no canto */}
        <UserMenu />

        {/* Conteúdo das páginas */}
        {children}
      </body>
    </html>
  );
}
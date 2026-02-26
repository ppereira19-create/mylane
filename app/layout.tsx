import "./globals.css";
import UserMenu from "./components/UserMenu";

export const metadata = {
  title: "MyLane – Premium Private Driver",
  description: "Transporte privado premium em Mustang Mach-E.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-black text-white">
        {/* NAVBAR FIXA NO TOPO */}
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-6xl items-center px-6">
            
            {/* Logo */}
            <a href="/" className="flex items-center gap-3">
              <img
                src="/topomenu.jpg"
                alt="MyLane"
                className="h-13 w-auto"
              />
            </a>

            {/* Menu centro com efeito premium */}
            <nav className="ml-12 hidden flex-1 items-center gap-10 text-base font-medium tracking-wide text-gray-200 md:flex">
              
              <a
                href="/reservar"
                className="relative group transition-all duration-300 hover:text-mylane-gold hover:-translate-y-0.5"
              >
                Serviços
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-mylane-gold transition-all duration-300 group-hover:w-full"></span>
              </a>

              <a
                href="#empresas"
                className="relative group transition-all duration-300 hover:text-mylane-gold hover:-translate-y-0.5"
              >
                Para empresas
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-mylane-gold transition-all duration-300 group-hover:w-full"></span>
              </a>

              <a
                href="#ajuda"
                className="relative group transition-all duration-300 hover:text-mylane-gold hover:-translate-y-0.5"
              >
                Ajuda
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-mylane-gold transition-all duration-300 group-hover:w-full"></span>
              </a>

            </nav>

            {/* Lado direito */}
            <div className="ml-auto flex items-center">
              <UserMenu />
            </div>

          </div>
        </header>

        <main className="min-h-screen pt-24">{children}</main>
      </body>
    </html>
  );
}
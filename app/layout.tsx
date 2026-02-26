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
              {/* OS NOSSOS SERVIÇOS – dropdown */}
              <div className="relative group">
                <a
                  href="#"
                  className="relative transition-all duration-300 hover:text-mylane-gold hover:-translate-y-0.5"
                >
                  Os Nossos Serviços
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-mylane-gold transition-all duration-300 group-hover:w-full" />
                </a>

                {/* Dropdown colado ao texto */}
                <div
                  className="
                    absolute left-0 top-full z-50
                    hidden w-64 rounded-xl border border-white/10
                    bg-black/95 p-4 shadow-2xl backdrop-blur-md
                    group-hover:block
                  "
                >
                  <a
                    href="/servicos/aeroporto"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-mylane-gold"
                  >
                    Transfers aeroporto
                  </a>
                  <a
                    href="/servicos/executivo"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-mylane-gold"
                  >
                    Serviço executivo
                  </a>
                  <a
                    href="/servicos/eventos"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-mylane-gold"
                  >
                    Eventos &amp; ocasiões
                  </a>
                  <a
                    href="/servicos/hora"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-mylane-gold"
                  >
                    Serviço à hora
                  </a>
                  <a
                    href="/servicos/cidade-a-cidade"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-mylane-gold"
                  >
                    Cidade a cidade
                  </a>
                </div>
              </div>

              {/* Restantes links */}
              <a
                href="#empresas"
                className="relative group transition-all duration-300 hover:text-mylane-gold hover:-translate-y-0.5"
              >
                Para empresas
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-mylane-gold transition-all duration-300 group-hover:w-full" />
              </a>

              <a
                href="#ajuda"
                className="relative group transition-all duration-300 hover:text-mylane-gold hover:-translate-y-0.5"
              >
                Ajuda
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-mylane-gold transition-all duration-300 group-hover:w-full" />
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
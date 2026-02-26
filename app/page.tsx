import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* HERO MUSTANG */}
      <section className="relative w-full h-[520px] overflow-hidden">
        <img
          src="/mustang1.png"
          alt="MyLane Mustang"
          className="w-full h-full object-cover object-[center_40%]"
        />

        {/* gradiente para ler o texto por cima */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />

        <div className="absolute inset-y-0 left-0 flex items-center px-6 md:px-20">
          <div className="max-w-xl space-y-4">
            <p className="text-[11px] tracking-[0.3em] text-mylane-gold">
              PREMIUM PRIVATE DRIVER
            </p>

            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Chega sempre em
              {" "}
              <span className="text-mylane-gold">modo MyLane</span>
              <br />
              no teu Mustang Mach-E.
            </h1>

            <p className="text-sm text-gray-300">
              Transfers de aeroporto jantares especiais eventos.
              Um motorista privado só para ti com água a bordo
              AC afinado e música ao teu gosto.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/reservar"
                className="btn-mylane-primary px-6 py-2 text-sm"
              >
                Reservar viagem
              </Link>

              <Link
                href="/login"
                className="btn-mylane-secondary px-6 py-2 text-sm"
              >
                Entrar / Criar conta
              </Link>
            </div>

            <p className="text-[11px] text-gray-400">
              Serviço sob marcação antecipada faturação com IVA incluído.
            </p>
          </div>
        </div>
      </section>

      {/* SECÇÃO TEXTO + LOGO (reaproveitar o que tinhas) */}
      <section className="flex-1 flex flex-col items-center justify-center py-10 px-4 space-y-8">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-gray-300">
            Transportes privados premium com motoristas profissionais
            conforto absoluto e experiência executive em cada viagem.
          </p>

          <div className="text-[13px] tracking-[0.16em] uppercase text-gray-500">
            You choose we drive
          </div>
        </div>

        <div className="animate-fade-in">
          <img
            src="/logo.png"
            alt="MyLane Logo"
            className="h-40 w-auto drop-shadow-[0_0_55px_rgba(243,201,105,0.75)]"
          />
        </div>
      </section>
    </main>
  );
}
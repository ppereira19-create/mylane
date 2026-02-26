import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      
      {/* HERO */}
      <section className="relative w-full h-[620px] md:h-[720px] overflow-hidden">
        
        {/* NOVA IMAGEM */}
        <img
          src="/home2.jpg"
          alt="MyLane Premium Private Driver"
          className="absolute top-0 -left-[-5%] h-full w-[120%] object-cover"
        />

        {/* OVERLAY MAIS FORTE À ESQUERDA */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/20 to-transparent" />

        {/* TEXTO */}
        <div className="relative z-10 flex h-full items-center px-6 md:px-20">
          <div className="max-w-xl space-y-5">
            
            <p className="text-[11px] tracking-[0.3em] text-mylane-gold">
              PREMIUM PRIVATE DRIVER
            </p>

            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              Chega sempre em{" "}
              <span className="text-mylane-gold">modo MyLane</span>
              <br />
              porque o destino é teu.
            </h1>

            <p className="text-sm text-gray-300">
              Chegadas marcantes.
Saídas discretas.
Um motorista privado totalmente dedicado a ti.

            </p>

            <div className="flex flex-wrap gap-4 pt-2">
             <Link
  href="/login?redirect=/reservar"
  className="btn-mylane-primary px-6 py-2 text-sm"
>
  Reservar viagem
</Link>

              <Link
                href="/login"
                className="btn-mylane-secondary px-7 py-3 text-sm"
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

      {/* SECÇÃO INFERIOR */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 px-4 space-y-8">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-gray-300">
            Transportes privados premium com motoristas profissionais
            conforto absoluto e experiência executive em cada viagem.
          </p>

          <div className="text-[13px] tracking-[0.16em] uppercase text-gray-500">
            You choose we drive
          </div>
        </div>

        <div>
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
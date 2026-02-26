export default function CidadePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="mb-10 border-b border-white/10 pb-6">
          <p className="text-[11px] tracking-[0.3em] text-mylane-gold uppercase">
            SERVIÇOS MYLANE
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
            Viagens cidade a cidade em conforto elétrico.
          </h1>
          <p className="mt-4 text-sm text-gray-300 max-w-2xl">
            Precisas de ir de uma cidade para outra sem quereres conduzir
            nem andar em comboios ou filas de autoestrada? A MyLane trata disso.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[1.7fr_1.1fr] items-start">
          <div className="space-y-5 text-sm text-gray-300">
            <p>
              Viagens mais longas pedem outro tipo de foco. Podes trabalhar
              descansar ouvir música ou simplesmente olhar pela janela
              enquanto o Mustang Mach-E faz o resto.
            </p>

            <p>
              Ideal para ligações entre cidades reuniões noutra zona do país
              escapadinhas de fim-de-semana ou para ir buscar alguém
              que preferes que venha em modo premium.
            </p>
          </div>

          <aside className="card-mylane p-6 space-y-4">
            <h2 className="text-sm font-semibold text-mylane-gold">
              Cidade a Cidade MyLane
            </h2>

            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Pick-up em morada ou hotel</li>
              <li>• Viagens interurbanas com conforto máximo</li>
              <li>• Paragens intermédias combinadas se precisares</li>
              <li>• Faturação com IVA para particulares ou empresas</li>
            </ul>

            <div className="pt-2">
              <a
                href="/login?redirect=/reservar"
                className="btn-mylane-primary w-full text-center text-sm"
              >
                Agendar viagem cidade a cidade
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
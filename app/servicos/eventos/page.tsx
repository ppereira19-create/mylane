export default function EventosPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="mb-10 border-b border-white/10 pb-6">
          <p className="text-[11px] tracking-[0.3em] text-mylane-gold uppercase">
            SERVIÇOS MYLANE
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
            Eventos & ocasiões especiais sem stress de transporte.
          </h1>
          <p className="mt-4 text-sm text-gray-300 max-w-2xl">
            Jantares casamentos aniversários concertos. Tu desfrutas do momento
            a MyLane trata de te levar e trazer com toda a calma.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[1.7fr_1.1fr] items-start">
          <div className="space-y-5 text-sm text-gray-300">
            <p>
              A ideia é simples: não te preocupas com estacionamento trânsito
              quem conduz na volta ou se podes beber um copo a mais.
            </p>

            <p>
              Combinamos a hora e o local de ida e a hora de regresso.
              No meio disso podes só viver o evento no máximo.
            </p>

            <p>
              Perfeito para noites especiais em casal grupos pequenos
              convidados VIP ou aquele evento em que não queres chegar de qualquer maneira.
            </p>
          </div>

        <aside className="card-mylane p-6 space-y-4">
            <h2 className="text-sm font-semibold text-mylane-gold">
              Eventos & Ocasiões MyLane
            </h2>

            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Ida & volta combinada à partida</li>
              <li>• Espera ajustada ao tipo de evento</li>
              <li>• Chegada e saída discretas ou marcantes tu escolhes</li>
              <li>• Ambiente relaxado no regresso</li>
            </ul>

            <div className="pt-2">
              <a
                href="/login?redirect=/reservar"
                className="btn-mylane-primary w-full text-center text-sm"
              >
                Agendar para um evento
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
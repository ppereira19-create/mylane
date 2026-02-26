export default function AeroportoPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Header */}
        <header className="mb-10 border-b border-white/10 pb-6">
          <p className="text-[11px] tracking-[0.3em] text-mylane-gold uppercase">
            SERVIÇOS MYLANE
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
            Transfers de aeroporto em modo MyLane.
          </h1>
          <p className="mt-4 text-sm text-gray-300 max-w-2xl">
            Aterras em silêncio. Sais em conforto. O Mustang Mach-E já está à tua
            espera à porta com tudo preparado para a tua viagem.
          </p>
        </header>

        {/* Conteúdo principal */}
        <div className="grid gap-10 md:grid-cols-[1.7fr_1.1fr] items-start">
          {/* Storytelling */}
          <div className="space-y-5 text-sm text-gray-300">
            <p>
              O transfer de aeroporto MyLane é pensado para quem não quer surpresas
              nem stress. Sem filas de táxi sem apps a falhar sem carros
              aleatórios. Sabes quem te vem buscar e em que carro vens.
            </p>

            <p>
              Monitorizamos o voo e ajustamos a hora de pick-up. Se houver atraso
              não ficas perdido. Chegas à zona combinada e encontras um Mustang
              Mach-E pronto a arrancar em silêncio.
            </p>

            <p>
              No interior encontras água fresca ambiente ajustado e uma condução
              suave. Se quiseres conversar conversamos. Se quiseres silêncio tens
              silêncio. O objetivo é só um: sair do aeroporto a pensar
              &quot;ok isto é outra liga&quot;.
            </p>
          </div>

          {/* Cartão lateral */}
          <aside className="card-mylane p-6 space-y-4">
            <h2 className="text-sm font-semibold text-mylane-gold">
              Transfer Aeroporto MyLane
            </h2>

            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Pick-up no aeroporto ou hotel</li>
              <li>• Monitorização de voo (chegadas)</li>
              <li>• Espera incluída conforme política MyLane</li>
              <li>• Água a bordo e ambiente premium</li>
              <li>• Faturação com IVA discriminado</li>
            </ul>

            <div className="pt-2">
              <a
                href="/login?redirect=/reservar"
                className="btn-mylane-primary w-full text-center text-sm"
              >
                Agendar este serviço
              </a>
            </div>

            <p className="text-[11px] text-gray-500">
              Os valores variam consoante o percurso a hora e as condições MyLane.
              Podes ver a estimativa em segundos na nossa área de reservas.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
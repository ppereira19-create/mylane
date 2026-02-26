export default function HoraPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="mb-10 border-b border-white/10 pb-6">
          <p className="text-[11px] tracking-[0.3em] text-mylane-gold uppercase">
            SERVIÇOS MYLANE
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
            Serviço à hora. O teu motorista privado on-demand.
          </h1>
          <p className="mt-4 text-sm text-gray-300 max-w-2xl">
            Várias paragens reuniões seguidas visitas em cidade nova.
            O Mustang e o motorista ficam por tua conta durante o tempo combinado.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[1.7fr_1.1fr] items-start">
          <div className="space-y-5 text-sm text-gray-300">
            <p>
              Em vez de andares a pedir transporte de cada vez ficas com o
              carro à tua disposição. Entrar sair continuar a rota. Sem espera
              sem apps a meio.
            </p>

            <p>
              Ideal para quem tem vários compromissos num só dia quer fazer
              visitas em pontos diferentes ou simplesmente prefere ter
              um motorista privado durante algumas horas.
            </p>
          </div>

          <aside className="card-mylane p-6 space-y-4">
            <h2 className="text-sm font-semibold text-mylane-gold">
              Serviço à Hora MyLane
            </h2>

            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Mínimo de horas a definir</li>
              <li>• Percursos flexíveis dentro da área combinada</li>
              <li>• Ideal para negócios ou turismo premium</li>
            </ul>

            <div className="pt-2">
              <a
                href="/login?redirect=/reservar"
                className="btn-mylane-primary w-full text-center text-sm"
              >
                Pedir proposta à hora
              </a>
            </div>

            <p className="text-[11px] text-gray-500">
              Este serviço pode exigir confirmação manual.
              Depois do pedido entramos em contacto para acertar detalhes.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
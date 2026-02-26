export default function ExecutivoPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="mb-10 border-b border-white/10 pb-6">
          <p className="text-[11px] tracking-[0.3em] text-mylane-gold uppercase">
            SERVIÇOS MYLANE
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
            Serviço executivo para quem não pode falhar.
          </h1>
          <p className="mt-4 text-sm text-gray-300 max-w-2xl">
            Reuniões visitas a clientes roadshows apresentações.
            Chegas sempre alinhado com a imagem que queres passar.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[1.7fr_1.1fr] items-start">
          <div className="space-y-5 text-sm text-gray-300">
            <p>
              No serviço executivo MyLane não é só transporte é presença.
              O carro a postura a comunicação o timing tudo conta para
              representar bem quem vai lá dentro.
            </p>

            <p>
              Ideal para diretores convidados internacionais investidores
              ou qualquer situação em que “chegar bem” faz parte do negócio.
            </p>

            <p>
              Podes usar o serviço ponto a ponto ou em formato “à disposição”
              durante algumas horas para várias paragens ao longo do dia.
            </p>
          </div>

          <aside className="card-mylane p-6 space-y-4">
            <h2 className="text-sm font-semibold text-mylane-gold">
              Serviço Executivo MyLane
            </h2>

            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Ideal para reuniões e clientes</li>
              <li>• Possibilidade de vários stops no mesmo dia</li>
              <li>• Condução discreta e postura profissional</li>
              <li>• Comunicação direta com o motorista</li>
              <li>• Faturação para empresas disponível</li>
            </ul>

            <div className="pt-2">
              <a
                href="/login?redirect=/reservar"
                className="btn-mylane-primary w-full text-center text-sm"
              >
                Agendar serviço executivo
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
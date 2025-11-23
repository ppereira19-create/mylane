export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Logótipo central com animação */}
      <div className="animate-fade-in mb-8">
        <img
          src="/logo.png"
          alt="MyLane Logo"
          className="h-64 w-auto drop-shadow-[0_0_55px_rgba(243,201,105,0.75)] hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Texto e botões */}
      <div className="max-w-md w-full text-center space-y-6 px-4">
        <p className="text-sm text-gray-300">
          Transportes privados premium com motoristas profissionais,
          conforto absoluto e experiência executive em cada viagem.
        </p>

        <div className="flex gap-3 justify-center">
          <a href="/login" className="btn-mylane-outline min-w-[120px]">
            Login
          </a>

          <a href="/criar-conta" className="btn-mylane-primary min-w-[140px]">
            Criar conta
          </a>
        </div>

        <div className="text-[13px] tracking-[0.16em] uppercase text-gray-500">
          You choose we drive
        </div>
      </div>
    </main>
  );
}
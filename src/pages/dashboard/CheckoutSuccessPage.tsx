import { Link } from 'react-router-dom';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#0A192F] border border-white/10 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#0070F3]/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#0070F3]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Benvinguda a Premium!</h1>

        <p className="text-[#8892B0] mb-6 leading-relaxed">
          La teva subscripció s'ha activat correctament. Tens{' '}
          <strong className="text-white">30 dies de prova gratuïts</strong> — el primer càrrec es farà
          quan finalitzi el període. Pots cancel·lar en qualsevol moment des del panell de facturació.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="w-full py-3 px-4 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-white font-semibold transition-colors"
          >
            Anar al panell
          </Link>
          <Link
            to="/dashboard/profile"
            className="text-sm text-[#8892B0] hover:text-white transition-colors"
          >
            Completar el meu perfil
          </Link>
        </div>
      </div>
    </div>
  );
}

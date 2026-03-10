import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Footer() {
  const marqueeText = "C Store Angola — Tecnologias que conectam você ao mundo. | GRUPO CASSAMINHA - COMÉRCIO & PRESTAÇÃO DE SERVIÇOS, (SU), LDA. NIF: 500286821";
  
  return (
    <footer className="border-t border-black/5 dark:border-white/5 py-8 mt-auto bg-white/50 dark:bg-zinc-950/50 relative">
      <div className="w-full max-w-7xl mx-auto px-4 text-center">
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-6 max-w-full lg:whitespace-nowrap leading-relaxed">
          C Store Angola — Tecnologias que conectam você ao mundo.<br className="sm:hidden" />
          <span className="hidden sm:inline"> | </span>
          GRUPO CASSAMINHA - COMÉRCIO & PRESTAÇÃO DE SERVIÇOS, (SU), LDA.<br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          NIF: 500286821
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-600 mb-4">
          Tecnologia desenvolvida por C Store Angola. © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
        <Link to="/admin" className="inline-flex text-zinc-400 hover:text-zinc-600 dark:text-zinc-700 dark:hover:text-zinc-500 transition-colors" title="Área Administrativa">
          <Lock className="w-4 h-4" />
        </Link>
      </div>
    </footer>
  );
}

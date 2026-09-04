import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </Link>

      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            Aspectos Legales
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Última actualización: Septiembre 2026
          </p>
        </div>

        <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Objeto y Alcance del Servicio</h2>
          <p>
            Hipnosis Chile ofrece acceso a contenido de audio y video digital para relajación, bienestar y sugestión guiada mediante un modelo de suscripción mensual recurrente.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">2. Descargo de Responsabilidad Médica</h2>
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            Las sesiones de hipnosis disponibles en la plataforma son exclusivamente para propósitos de bienestar y desarrollo personal. <strong>No constituyen psicoterapia, psiquiatría ni medicina</strong>. No deben utilizarse como reemplazo de atención profesional sanitaria. Queda terminantemente prohibido escuchar sesiones mientras se conduce o se realizan actividades que requieran atención activa.
          </div>
        </section>

        <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">3. Pagos, Facturación y Cancelación</h2>
          <p>
            Los pagos se procesan de forma segura a través de Mercado Pago. El cobro recurrente se efectúa mensualmente a partir de la fecha de suscripción. El usuario puede cancelar en cualquier momento desde su perfil o a través de su cuenta de Mercado Pago sin penalizaciones.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">4. Propiedad Intelectual</h2>
          <p>
            Todos los audios, videos, guiones, diseños y marcas comerciales son propiedad exclusiva de Hipnosis Chile y están protegidos por las leyes de propiedad intelectual chilenas e internacionales.
          </p>
        </section>
      </div>
    </div>
  );
}

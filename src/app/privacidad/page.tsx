import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
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
            Privacidad & Seguridad
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Política de Privacidad
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Última actualización: Septiembre 2026
          </p>
        </div>

        <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Datos Recopilados</h2>
          <p>
            Recopilamos únicamente tu dirección de correo electrónico para la autenticación y registro de cuenta con Supabase Auth, así como tu progreso de reproducción para reanudar tus sesiones.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">2. Seguridad de Pagos</h2>
          <p>
            No almacenamos los datos de tus tarjetas de crédito o débito en nuestros servidores. Todas las transacciones se realizan directamente a través de las pasarelas seguras y certificadas de Mercado Pago.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">3. Confidencialidad</h2>
          <p>
            Nunca venderemos ni transferiremos tus datos personales a terceros con fines publicitarios. Tus datos solo se usan para proveer el servicio de streaming y soporte técnico.
          </p>
        </section>
      </div>
    </div>
  );
}

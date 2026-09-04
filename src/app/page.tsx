'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Moon,
  HeartHandshake,
  Compass,
  CheckCircle2,
  ShieldAlert,
  Volume2,
  Lock,
  ArrowRight,
  Play,
  Pause,
  HelpCircle,
  Clock,
  Smartphone,
  Headphones
} from 'lucide-react';
import { MOCK_CATEGORIAS, MOCK_SESIONES } from '@/lib/data/mockData';
import { SessionCard } from '@/components/sessions/SessionCard';
import { usePlayer } from '@/context/PlayerContext';

export default function LandingPage() {
  const { currentSession, isPlaying, playSession, togglePlay } = usePlayer();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const demoSampleSession = MOCK_SESIONES[0];
  const isSamplePlaying = currentSession?.id === demoSampleSession.id && isPlaying;

  const faqs = [
    {
      q: '¿Qué es la hipnosis clínica y qué se siente durante una sesión?',
      a: 'La hipnosis es un estado natural de relajación focalizada donde el diálogo crítico se calma y el cerebro entra en ritmos alfa y theta. Siempre mantienes el control consciente, nunca pierdes el conocimiento y sales del estado cuando lo deseas, sintiéndote renovado y en paz.',
    },
    {
      q: '¿Cómo funciona la membresía mensual de Hipnosis Chile?',
      a: 'Por un único pago mensual de $9.990 CLP, obtienes acceso ilimitado a toda la biblioteca de audios y videos de hipnosis, meditaciones nocturnas, reprogramación de hábitos y anclajes de confianza. Sin límites de reproducción y con nuevas sesiones cada semana.',
    },
    {
      q: '¿Puedo escuchar las sesiones en segundo plano y con el celular bloqueado?',
      a: '¡Sí! Nuestra plataforma web está optimizada para dispositivos móviles (iOS y Android), permitiendo reproducir con la pantalla bloqueada o mientras realizas otras tareas relajantes.',
    },
    {
      q: '¿Puedo cancelar mi suscripción en cualquier momento?',
      a: 'Por supuesto. Desde tu perfil puedes cancelar o pausar tu suscripción con un solo clic a través de Mercado Pago, sin letras chicas ni periodos de permanencia obligatoria.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* SECCIÓN HERO                                                  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Luces de fondo ambientales */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Streaming de Hipnosis & Bienestar Digital #1 en Chile</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl">
          Paz mental profunda y descanso reparador,{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">
            en un solo lugar.
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 mt-6 max-w-2xl leading-relaxed">
          Accede 24/7 a sesiones guiadas de hipnosis clínica, inducciones para el sueño profundo y reprogramación mental por un único pago mensual.
        </p>

        {/* Botones CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full sm:w-auto">
          <Link
            href="/registro"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            Comenzar Ahora por $9.990/mes
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-colors"
          >
            Ya tengo una cuenta
          </Link>
        </div>

        {/* Micro-demo interactiva de audio */}
        <div className="mt-12 w-full max-w-lg p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (isSamplePlaying) {
                  togglePlay();
                } else {
                  playSession(demoSampleSession);
                }
              }}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
            >
              {isSamplePlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
                Muestra Gratuita
              </span>
              <h4 className="text-sm font-semibold text-white truncate">
                {demoSampleSession.titulo}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                Prueba 60 segundos de relajación guiada
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <Headphones className="w-4 h-4 text-indigo-400" />
            <span>Usar audífonos</span>
          </div>
        </div>

        {/* Garantías y logos */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Pago seguro con Mercado Pago</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Cancela cuando quieras</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Audio en segundo plano</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PROPUESTA DE VALOR / BENEFICIOS                               */}
      {/* ------------------------------------------------------------- */}
      <section id="beneficios" className="py-16 bg-slate-900/40 border-y border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              ¿Por qué Hipnosis Chile?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Diseñado para reprogramar tu mente sin esfuerzo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Moon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Sueño Profundo Garantizado</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Supera el insomnio sin fármacos. Inducciones sonoras con frecuencias delta que desaceleran tu actividad cerebral para dormir toda la noche.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Regulación Somática del Estrés</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Técnicas hipnóticas ericksonianas para aliviar el pecho apretado, calmar la taquicardia y resetear el sistema nervioso autónomo.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Experiencia Streaming Tipo Spotify</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Interfaz fluida y oscura que guarda tu punto de escucha automáticamente. Escucha mientras caminas o descansas con la pantalla apagada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* VISTA PREVIA DE SESIONES Y CATEGORÍAS                          */}
      {/* ------------------------------------------------------------- */}
      <section id="sesiones" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Catálogo de Sesiones
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Explora algunas de nuestras sesiones guiadas
            </h2>
          </div>
          <Link
            href="/registro"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Acceder al catálogo completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_SESIONES.slice(0, 3).map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PLAN Y PRECIOS                                                */}
      {/* ------------------------------------------------------------- */}
      <section id="membresia" className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            Membresía Todo Incluido
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Invierte en tu tranquilidad por menos de lo que cuesta un café a la semana
          </h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Sin contratos forzosos. Disfruta de libertad total y cancela en cualquier momento con un clic.
          </p>

          {/* Tarjeta de Precio */}
          <div className="mt-10 max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border-2 border-indigo-500/50 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[11px] font-bold uppercase tracking-wider text-white shadow">
              Plan Único Ilimitado
            </div>

            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold text-white">$9.990</span>
              <span className="text-slate-400 font-medium">CLP / mes</span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Cobro recurrente automático procesado con Mercado Pago
            </p>

            <ul className="mt-6 space-y-3 text-left text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Acceso 24/7 a todas las sesiones de audio y video</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Reproducción móvil en segundo plano</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Nuevas sesiones guiadas añadidas cada semana</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Historial de progreso y lista de favoritos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Cancela cuando quieras con 1 clic</span>
              </li>
            </ul>

            <Link
              href="/registro"
              className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              Suscribirse con Mercado Pago
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Transacción 100% encriptada y segura</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PREGUNTAS FRECUENTES (FAQ)                                    */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            Dudas Comunes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-indigo-300 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <span className="text-xl text-indigo-400">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER Y AVISO LEGAL DE USO RESPONSABLE (MANDATORIO)          */}
      {/* ------------------------------------------------------------- */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Disclaimer Médico Destacado */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex items-start gap-3.5 text-xs sm:text-sm text-slate-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300 block">
                Aviso de Uso Responsable y Descargo Médico:
              </span>
              <p className="leading-relaxed text-slate-400 text-xs">
                Las sesiones de hipnosis y bienestar disponibles en Hipnosis Chile son herramientas de desarrollo personal, relajación guiada y entrenamiento mental consciente. <strong>No constituyen ni sustituyen la consulta, diagnóstico o tratamiento de un médico, psiquiatra o psicólogo clínico</strong>. Si padeces alguna condición médica, epilepsia o trastorno psiquiátrico severo, consulta con tu médico de cabecera antes de iniciar. <strong>Nunca escuches estas sesiones mientras conduces vehículos o manejas maquinaria pesada</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-300">Hipnosis Chile</span>
              <span>© {new Date().getFullYear()} Todos los derechos reservados.</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/terminos" className="hover:text-slate-300 transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="hover:text-slate-300 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/#faq" className="hover:text-slate-300 transition-colors">
                Ayuda y Soporte
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

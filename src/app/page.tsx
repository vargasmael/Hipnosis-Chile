'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Moon,
  HeartHandshake,
  Brain,
  CheckCircle2,
  ShieldAlert,
  Lock,
  ArrowRight,
  Play,
  Pause,
  Headphones,
  Wind,
  ShieldCheck,
  Quote,
  Feather,
  Clock,
  Compass
} from 'lucide-react';
import { MOCK_SESIONES } from '@/lib/data/mockData';
import { SessionCard } from '@/components/sessions/SessionCard';
import { usePlayer } from '@/context/PlayerContext';

export default function LandingPage() {
  const { currentSession, isPlaying, playSession, togglePlay } = usePlayer();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const demoSampleSession = MOCK_SESIONES[0];
  const isSamplePlaying = currentSession?.id === demoSampleSession.id && isPlaying;

  const faqs = [
    {
      q: '¿Qué se siente durante una sesión de Re-Programa?',
      a: 'Es una experiencia profundamente placentera y reconfortante. Es similar al instante exacto antes de quedarte dormido: tu cuerpo entra en un descanso total y tu respiración se ralentiza, mientras tu mente permanece en una calma lúcida. Siempre conservas el control consciente y sales del estado sintiéndote como si te hubieran quitado un peso inmenso de encima.',
    },
    {
      q: '¿Y si me quedo dormido durante la sesión?',
      a: '¡Es lo ideal en las sesiones nocturnas! Tu subconsciente continúa procesando las sugestiones positivas y las frecuencias sonoras reparadoras incluso mientras duermes profundamente, permitiendo que tu sistema nervioso se regenere por completo.',
    },
    {
      q: '¿Cómo funciona la suscripción mensual de Re-Programa?',
      a: 'Por un único pago mensual de $9.990 CLP, tienes acceso ilimitado a toda la biblioteca de hipnosis guiada, audios para insomnio, alivio de ansiedad y reprogramación de hábitos. Sin restricciones de horario ni límites de reproducción.',
    },
    {
      q: '¿Puedo escuchar en mi celular con la pantalla apagada?',
      a: 'Sí, totalmente. Nuestra plataforma está optimizada para que puedas ponerte tus audífonos, bloquear la pantalla del celular y dejar que el audio siga fluyendo sin luz que altere tu descanso ni interrupciones.',
    },
    {
      q: '¿Cómo cancelo si decido no continuar?',
      a: 'Tienes libertad absoluta. Puedes cancelar tu membresía en cualquier momento desde tu perfil con un solo clic. Sin llamadas, sin explicaciones y sin cláusulas de permanencia.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#140f0e] text-[#ece5e2] overflow-x-hidden selection:bg-[#a55850] selection:text-white font-sans-persona">
      {/* ------------------------------------------------------------- */}
      {/* 1. SECCIÓN HERO (El gancho dramático)                         */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Atmósfera de iluminación suave tras la tormenta (Colores Persona: Terracota & Sandstone) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#a55850]/12 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[380px] h-[380px] bg-[#b98d76]/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Badge emotivo inspirado en Persona */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[#b98d76] text-xs font-medium mb-8 shadow-inner backdrop-blur-md">
          <Feather className="w-3.5 h-3.5 text-[#a55850]" />
          <span className="tracking-wide">Tu refugio íntimo de paz mental y descanso profundo</span>
        </div>

        {/* Título Principal Dramático con Tipografía Editorial Serif Playfair Display */}
        <h1 className="font-serif-persona text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-[#fbf7f4] tracking-tight leading-[1.12] max-w-4xl">
          ¿Sientes que tu propia mente{' '}
          <span className="italic font-normal bg-gradient-to-r from-[#fbf7f4] via-[#d8aba1] to-[#b98d76] bg-clip-text text-transparent">
            te está frenando?
          </span>
        </h1>

        {/* Subtítulo Empático */}
        <p className="text-base sm:text-lg md:text-xl text-[#a89b97] mt-7 max-w-2xl leading-relaxed font-light">
          El estrés, las noches sin dormir y la ansiedad silenciosa te están consumiendo.
          No tienes que seguir luchando solo. Es hora de recuperar el control.
        </p>

        {/* Botones CTA estilo Persona */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          <Link
            href="/registro"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-base shadow-xl shadow-[#a55850]/25 transition-all hover:scale-[1.02] active:scale-95 border border-[#a55850]"
          >
            <span>Empieza a Sanar Hoy - Acceso Inmediato</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#1c1514] hover:bg-[#251d1c] text-[#ece5e2] border border-[#3b2c29] font-medium text-sm transition-colors backdrop-blur-sm"
          >
            Ya tengo una cuenta
          </Link>
        </div>

        {/* Micro-reproductor interactivo: Muestra de alivio inmediato */}
        <div className="mt-14 w-full max-w-xl p-4 sm:p-5 rounded-3xl bg-[#1c1514]/90 border border-[#3b2c29] shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 text-left transition-all hover:border-[#a55850]/40">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => {
                if (isSamplePlaying) {
                  togglePlay();
                } else {
                  playSession(demoSampleSession);
                }
              }}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#a55850] hover:bg-[#b8665d] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#a55850]/30 transition-transform active:scale-95"
              aria-label="Escuchar muestra gratuita"
            >
              {isSamplePlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#b98d76] uppercase tracking-wider flex items-center gap-1">
                <Wind className="w-3 h-3 text-[#a55850]" /> Muestra de Calma Inmediata (60s)
              </span>
              <h4 className="font-serif-persona text-sm sm:text-base font-medium text-[#fbf7f4] truncate mt-0.5">
                {demoSampleSession.titulo}
              </h4>
              <p className="text-xs text-[#a89b97] truncate">
                Cierra los ojos, respira hondo y siente la liberación
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#a89b97] shrink-0 px-3 py-1.5 rounded-full bg-[#140f0e] border border-[#3b2c29]">
            <Headphones className="w-3.5 h-3.5 text-[#b98d76]" />
            <span>Usar audífonos</span>
          </div>
        </div>

        {/* Sellos de tranquilidad */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#9c8e8a]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#b98d76]" />
            <span>100% Confidencial y Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#b98d76]" />
            <span>Sin citas ni salas de espera</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#b98d76]" />
            <span>Cancela cuando quieras con 1 clic</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. SECCIÓN DEL PROBLEMA (Conexión sentimental / Agitación PAS) */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 md:py-28 bg-[#181211] border-y border-[#2d2220] px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Cabecera de dolor empático */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-widest block mb-2 font-sans-persona">
              La batalla silenciosa
            </span>
            <h2 className="font-serif-persona text-3xl sm:text-5xl md:text-6xl font-normal text-[#fbf7f4] tracking-tight leading-tight">
              Sabemos lo agotador que es fingir que todo está bien.
            </h2>
            <p className="text-[#a89b97] text-base sm:text-lg mt-4 leading-relaxed font-light">
              Sonreír por fuera mientras por dentro sientes que estás al borde del colapso no es vivir,
              es simplemente resistir. Reconocer lo que sientes no es debilidad; es el primer paso para sanar.
            </p>
          </div>

          {/* Tres Tarjetas de Dolor Sentimental - Formato Persona Icon Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tarjeta 1: Noches en Blanco */}
            <div className="group p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] hover:border-[#a55850]/60 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a55850]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#a55850]/15 transition-colors" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#a55850] text-white flex items-center justify-center mb-6 shadow-md shadow-[#a55850]/20">
                  <Moon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-wider">El Insomnio</span>
                <h3 className="font-serif-persona text-2xl font-normal text-[#fbf7f4] mt-1 mb-3">Noches en Blanco</h3>
                <p className="text-base font-medium text-[#d8aba1] leading-snug">
                  Tu cuerpo está exhausto, pero tu mente no se apaga.
                </p>
                <p className="text-sm text-[#9c8e8a] mt-3 leading-relaxed font-light">
                  Pasan las horas mirando el techo, dando vueltas en la cama, repasando errores del pasado o anticipando problemas del mañana. Despiertas con más cansancio del que tenías al acostarte.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#2d2220] text-xs text-[#b98d76]/90 italic font-serif-persona">
                «Solo quiero poder dormir sin que mi cabeza no pare de dar vueltas.»
              </div>
            </div>

            {/* Tarjeta 2: Estrés Invisible */}
            <div className="group p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] hover:border-[#b98d76]/60 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#b98d76]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#b98d76]/15 transition-colors" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#b98d76] text-white flex items-center justify-center mb-6 shadow-md shadow-[#b98d76]/20">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-wider">La Ansiedad</span>
                <h3 className="font-serif-persona text-2xl font-normal text-[#fbf7f4] mt-1 mb-3">Estrés Invisible</h3>
                <p className="text-base font-medium text-[#d8aba1] leading-snug">
                  Ese peso en el pecho que te acompaña desde que despiertas.
                </p>
                <p className="text-sm text-[#9c8e8a] mt-3 leading-relaxed font-light">
                  Una respiración superficial, rigidez permanente en mandíbula y cuello, y esa alarma interna encendida que te hace sentir que algo malo va a suceder, incluso en momentos de calma.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#2d2220] text-xs text-[#b98d76]/90 italic font-serif-persona">
                «Siento que cargo un peso enorme que nadie más puede ver.»
              </div>
            </div>

            {/* Tarjeta 3: Autosabotaje */}
            <div className="group p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] hover:border-[#a55850]/60 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a55850]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#a55850]/15 transition-colors" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#a55850] text-white flex items-center justify-center mb-6 shadow-md shadow-[#a55850]/20">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-wider">La Voz Crítica</span>
                <h3 className="font-serif-persona text-2xl font-normal text-[#fbf7f4] mt-1 mb-3">Autosabotaje</h3>
                <p className="text-base font-medium text-[#d8aba1] leading-snug">
                  Esa voz interna que te dice que no eres suficiente.
                </p>
                <p className="text-sm text-[#9c8e8a] mt-3 leading-relaxed font-light">
                  El síndrome del impostor, la culpa irracional y los patrones repetitivos que sabotean tus metas y tus relaciones. Un ciclo de exigencia desmedida que nunca te permite sentirte en paz.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#2d2220] text-xs text-[#b98d76]/90 italic font-serif-persona">
                «Por más que me esfuerzo, siento que nunca es suficiente.»
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. CITA TERAPÉUTICA (Inspirada en el Counseling de Persona)    */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#181211] border border-[#332623] relative">
          <Quote className="w-10 h-10 text-[#a55850]/40 mx-auto mb-4" />
          <p className="font-serif-persona text-xl sm:text-2xl text-[#fbf7f4] italic font-normal leading-relaxed">
            «La mente no se calma con exigencia ni fuerza bruta. Se transforma cuando le ofreces un espacio de silencio, contención y el lenguaje adecuado para soltar.»
          </p>
          <span className="block text-xs uppercase tracking-widest text-[#b98d76] mt-4 font-semibold">
            Filosofía de Reprogramación Consciente
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. SECCIÓN DE LA SOLUCIÓN (La plataforma / Tu refugio)         */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[#b98d76] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#a55850]" />
            <span>La liberación que tu mente estaba pidiendo</span>
          </div>
          <h2 className="font-serif-persona text-3xl sm:text-5xl md:text-6xl font-normal text-[#fbf7f4] tracking-tight">
            Bienvenido a Re-Programa.{' '}
            <span className="italic font-normal bg-gradient-to-r from-[#d8aba1] to-[#b98d76] bg-clip-text text-transparent">
              Tu refugio privado.
            </span>
          </h2>
          <p className="text-[#a89b97] text-base sm:text-lg mt-6 leading-relaxed font-light max-w-2xl mx-auto">
            Una biblioteca exclusiva de sesiones de hipnosis y reprogramación mental.
            Accede 24/7 desde tu celular, ponte los audífonos y deja que nosotros guiemos tu mente hacia la paz que mereces. Todo por un único pago mensual, cancela cuando quieras.
          </p>
        </div>

        {/* Pilares de la Experiencia con la estética de Persona */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="p-7 rounded-3xl bg-[#1e1716] border border-[#3b2c29] flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#a55850]/20 border border-[#a55850]/40 flex items-center justify-center text-[#a55850] shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-persona text-lg font-normal text-[#fbf7f4]">Inducciones Sonoras Profundas</h4>
              <p className="text-xs sm:text-sm text-[#9c8e8a] mt-1.5 leading-relaxed font-light">
                Frecuencias alfa y ondas delta diseñadas para desacelerar tu frecuencia cardíaca y calmar la amígdala cerebral en minutos.
              </p>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#1e1716] border border-[#3b2c29] flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#b98d76]/20 border border-[#b98d76]/40 flex items-center justify-center text-[#b98d76] shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-persona text-lg font-normal text-[#fbf7f4]">Reprogramación Subconsciente</h4>
              <p className="text-xs sm:text-sm text-[#9c8e8a] mt-1.5 leading-relaxed font-light">
                Técnicas clínicas para reescribir hábitos automáticos, apagar el autosabotaje y restaurar una autoconfianza sólida.
              </p>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#1e1716] border border-[#3b2c29] flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#a55850]/20 border border-[#a55850]/40 flex items-center justify-center text-[#a55850] shrink-0">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-persona text-lg font-normal text-[#fbf7f4]">Reproducción Nocturna sin Luz</h4>
              <p className="text-xs sm:text-sm text-[#9c8e8a] mt-1.5 leading-relaxed font-light">
                Bloquea tu pantalla, déjate guiar en la oscuridad y despierta renovado al día siguiente sin interrupciones.
              </p>
            </div>
          </div>
        </div>

        {/* Catálogo de Muestra */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2d2220] pb-4">
            <div>
              <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-widest font-sans-persona">
                Catálogo Exclusivo
              </span>
              <h3 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] mt-1">
                Sesiones diseñadas para cada momento de tu día
              </h3>
            </div>
            <Link
              href="/registro"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#b98d76] hover:text-[#d8aba1] transition-colors"
            >
              Explorar todo el catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {MOCK_SESIONES.slice(0, 3).map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. SECCIÓN DE PRECIOS Y CIERRE (La oferta irresistible)       */}
      {/* ------------------------------------------------------------- */}
      <section id="membresia" className="py-20 md:py-32 bg-gradient-to-b from-[#181211] via-[#140f0e] to-[#140f0e] px-4 sm:px-6 lg:px-8 border-t border-[#2d2220] relative">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-widest block mb-2 font-sans-persona">
            Tu Paz Mental No Es Un Lujo
          </span>
          <h2 className="font-serif-persona text-3xl sm:text-5xl md:text-6xl font-normal text-[#fbf7f4] tracking-tight">
            ¿Cuánto vale volver a dormir en paz?
          </h2>
          <p className="text-[#a89b97] mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-light">
            Una sola sesión presencial de terapia o hipnosis tradicional cuesta entre $40.000 y $60.000 CLP.
            En <strong>Re-Programa</strong> tienes acompañamiento nocturno y diario ilimitado por una fracción ínfima.
          </p>

          {/* Tarjeta de Precio Estilo Persona */}
          <div className="mt-14 max-w-lg mx-auto p-8 sm:p-12 pb-10 rounded-3xl bg-[#1e1716] border-2 border-[#a55850]/60 shadow-2xl relative backdrop-blur-md">
            {/* Tag destacado */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-[#a55850] text-[11px] font-bold uppercase tracking-widest text-white shadow-xl shadow-[#a55850]/30 border border-[#b8665d] whitespace-nowrap z-10">
              Membresía Ilimitada
            </div>

            <div className="mt-4 flex items-baseline justify-center gap-1.5">
              <span className="font-serif-persona text-5xl sm:text-6xl font-normal text-[#fbf7f4] tracking-tight">$9.990</span>
              <span className="text-[#a89b97] font-medium text-sm sm:text-base">CLP / mes</span>
            </div>

            <p className="text-xs text-[#d8aba1] mt-2 font-medium">
              Menos de $330 al día {'\u2022'} Más económico que un café a la semana
            </p>

            <div className="my-6 border-t border-[#2d2220]" />

            {/* Lista de beneficios */}
            <ul className="space-y-4 text-left text-sm text-[#ece5e2]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#b98d76] shrink-0 mt-0.5" />
                <span>Acceso 24/7 sin límites a toda la biblioteca de reprogramación</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#b98d76] shrink-0 mt-0.5" />
                <span>Inducciones para insomnio, ansiedad, estrés y autoestima</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#b98d76] shrink-0 mt-0.5" />
                <span>Reproducción móvil con pantalla bloqueada para la noche</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#b98d76] shrink-0 mt-0.5" />
                <span>Nuevas sesiones guiadas añadidas periódicamente</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#b98d76] shrink-0 mt-0.5" />
                <span>Libertad absoluta: cancela con 1 solo clic en cualquier momento</span>
              </li>
            </ul>

            {/* Botón CTA de Cierre */}
            <Link
              href="/registro"
              className="mt-10 mb-4 w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-base shadow-xl shadow-[#a55850]/30 transition-all hover:scale-[1.02] active:scale-95 border border-[#a55850]"
            >
              <span>Quiero Re-Programar mi mente</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Garantía de Seguridad */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#a89b97]">
              <Lock className="w-3.5 h-3.5 text-[#b98d76]" />
              <span>Cobro seguro procesado con Mercado Pago {'\u2022'} Sin permanencia</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. PREGUNTAS FRECUENTES (FAQ)                                 */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-widest block mb-1 font-sans-persona">
            Resolvemos tus dudas
          </span>
          <h2 className="font-serif-persona text-3xl sm:text-4xl font-normal text-[#fbf7f4]">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#2d2220] rounded-2xl bg-[#181211] overflow-hidden transition-colors hover:border-[#3b2c29]"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-medium text-[#fbf7f4] hover:text-[#d8aba1] transition-colors"
                >
                  <span className="text-sm sm:text-base font-serif-persona">{faq.q}</span>
                  <span className="text-lg text-[#a55850] font-bold shrink-0">
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#a89b97] leading-relaxed border-t border-[#261c1a] pt-3 font-light">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. FOOTER Y AVISOS LEGALES (Uso responsable mandatorio)       */}
      {/* ------------------------------------------------------------- */}
      <footer className="mt-auto border-t border-[#261c1a] bg-[#110c0b] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Disclaimer Médico Destacado */}
          <div className="p-5 rounded-3xl bg-[#181211] border border-[#a55850]/20 flex items-start gap-3.5 text-xs sm:text-sm text-[#a89b97]">
            <ShieldAlert className="w-5 h-5 text-[#a55850] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-serif-persona text-sm font-normal text-[#d8aba1] block">
                Aviso de Uso Responsable y Descargo de Responsabilidad:
              </span>
              <p className="leading-relaxed text-[#9c8e8a] text-xs font-light">
                Las sesiones de bienestar, relajación e hipnosis disponibles en <strong>Re-Programa</strong> son herramientas diseñadas para el desarrollo personal, la inducción al descanso y el entrenamiento mental consciente. <strong>No constituyen ni sustituyen la atención médica, psiquiátrica o psicológica profesional ni diagnósticos clínicos</strong>. Si padeces alguna condición de salud mental severa, epilepsia o patología neurológica, consulta a tu médico especialista. <strong>Nunca escuches estas sesiones mientras conduces vehículos o manejas maquinaria pesada</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e1716] text-xs text-[#7d6f6b]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#a55850] flex items-center justify-center text-white shadow-sm shadow-[#a55850]/30">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif-persona text-sm font-normal text-[#fbf7f4]">Re-Programa</span>
              <span>© {new Date().getFullYear()} Todos los derechos reservados.</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/terminos" className="hover:text-[#d8aba1] transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="hover:text-[#d8aba1] transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/#faq" className="hover:text-[#d8aba1] transition-colors">
                Ayuda y Soporte
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

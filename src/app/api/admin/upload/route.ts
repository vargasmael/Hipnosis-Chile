import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2/client';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'media';

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${sanitizedFilename}`;

    // Si Cloudflare R2 tiene credenciales configuradas
    if (process.env.R2_ACCOUNT_ID && !process.env.R2_ACCOUNT_ID.includes('placeholder')) {
      const result = await uploadToR2(buffer, key, file.type);
      return NextResponse.json({ url: result.url, key: result.key });
    } else {
      // Modo fallback / simulación cuando aún no se conectan las llaves de R2
      console.warn('[R2 Upload] Usando URL de demostración para R2 (sin credenciales de producción).');
      const mockUrl = file.type.startsWith('audio')
        ? 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3'
        : 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80';
      return NextResponse.json({
        url: mockUrl,
        key,
        note: 'Archivo procesado en modo demo local',
      });
    }
  } catch (error: any) {
    console.error('Error subiendo archivo a Cloudflare R2:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar la subida del archivo' },
      { status: 500 }
    );
  }
}

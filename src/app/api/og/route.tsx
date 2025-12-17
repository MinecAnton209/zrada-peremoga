import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query')?.slice(0, 30) || 'РЕЄСТР ДОЛІ';
    const resCode = searchParams.get('res') || 'idle'; 
    let fontData;

    try {
      const fontUrl = new URL('../../../../public/fonts/Oswald-Bold.ttf', import.meta.url);
      fontData = await fetch(fontUrl).then(res => res.arrayBuffer());
    } catch (e) {
      console.warn("Локальний шрифт не знайдено, завантажую з мережі...");
      // 2. Резервний варіант (GitHub CDN), якщо локальний файл недоступний
      fontData = await fetch(
        new URL('https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/static/Oswald-Bold.ttf')
      ).then(res => res.arrayBuffer());
    }

    let bg = '#1e293b'; 
    let text = 'white';
    let status = 'ДЕРЖАВНИЙ РЕЄСТР';
    let emoji = '🇺🇦';

    switch (resCode) {
        case '0':
            bg = '#ca8a04';
            status = 'ПЕРЕМОГА';
            emoji = '🟡';
            break;
        case '1':
            bg = '#dc2626';
            status = 'ЗРАДА';
            emoji = '🔴';
            break;
        case '2':
            bg = 'linear-gradient(to bottom right, #facc15, #ca8a04)';
            status = 'ТОТАЛЬНА ПЕРЕМОГА';
            emoji = '🌟';
            break;
        case '3':
            bg = 'linear-gradient(to bottom right, #7f1d1d, #450a0a)';
            status = 'ТОТАЛЬНА ЗРАДА';
            emoji = '💀';
            break;
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: bg,
            color: text,
            fontFamily: '"Oswald"',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          {/* Верхняя плашка */}
          <div style={{ 
              display: 'flex', 
              fontSize: 30, 
              opacity: 0.8, 
              marginBottom: 20,
              textTransform: 'uppercase',
              letterSpacing: '4px'
          }}>
            {status} {emoji}
          </div>

          {/* Основной запрос */}
          <div style={{ 
              display: 'flex', 
              fontSize: query.length > 15 ? 80 : 110,
              fontWeight: 900,
              textTransform: 'uppercase',
              lineHeight: 1,
              textShadow: '0 4px 10px rgba(0,0,0,0.3)',
              marginBottom: 40,
          }}>
            {query}
          </div>

          {/* Футер */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', opacity: 0.6, fontSize: 24 }}>
             zp.minecanton209.pp.ua
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Oswald',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

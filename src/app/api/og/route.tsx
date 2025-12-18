import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query')?.slice(0, 25) || 'РЕЄСТР ДОЛІ').toUpperCase();
    const resCode = searchParams.get('res') || 'idle';

    let fontData;
    try {
      const fontUrl = new URL('../../../../public/fonts/Oswald-Bold.ttf', import.meta.url);
      fontData = await fetch(fontUrl).then(res => res.arrayBuffer());
    } catch (e) {
      fontData = await fetch(
        new URL('https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/static/Oswald-Bold.ttf')
      ).then(res => res.arrayBuffer());
    }

    let bg = 'linear-gradient(to bottom right, #1e293b, #0f172a)';
    let borderColor = '#334155';
    let status = 'ДЕРЖАВНИЙ РЕЄСТР';
    let emoji = '🇺🇦';
    let textColor = 'white';

    if (resCode === '0') {
        bg = 'linear-gradient(to bottom right, #facc15, #ca8a04)'; 
        borderColor = '#fde047';
        status = 'ПЕРЕМОГА'; emoji = '🟡'; color: 'black';
    }
    if (resCode === '1') {
        bg = 'linear-gradient(to bottom right, #dc2626, #b91c1c)'; 
        borderColor = '#fca5a5';
        status = 'ЗРАДА'; emoji = '🔴';
    }
    if (resCode === '2') {
        bg = 'linear-gradient(to bottom right, #fde047, #eab308, #a16207)'; 
        borderColor = '#ffffff';
        status = 'ТОТАЛЬНА ПЕРЕМОГА'; emoji = '🌟'; 
        textColor = 'black';
    }
    if (resCode === '3') {
        bg = 'linear-gradient(to bottom right, #ef4444, #991b1b, #450a0a)'; 
        borderColor = '#000000';
        status = 'ТОТАЛЬНА ЗРАДА'; emoji = '💀';
    }

    const fontSize = query.length > 12 ? 100 : query.length > 7 ? 130 : 160;

    return new ImageResponse(
      (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          padding: '20px',
          background: bg,
          fontFamily: '"Oswald"',
        }}>
          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: `8px solid ${borderColor}`,
            borderRadius: '20px',
            color: textColor,
            textAlign: 'center',
            padding: '40px',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
          }}>
            {/* Статус */}
            <div style={{ 
                display: 'flex', 
                fontSize: 36, 
                opacity: 0.9, 
                marginBottom: 30, 
                letterSpacing: '6px',
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {status} {emoji}
            </div>

            {/* Головне слово */}
            <div style={{ 
              display: 'flex', 
              fontSize: fontSize, 
              fontWeight: 900, 
              lineHeight: 0.9,
              marginBottom: 40,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              wordBreak: 'break-word'
            }}>
              {query}
            </div>

            {/* Футер */}
            <div style={{ display: 'flex', marginTop: 'auto', opacity: 0.6, fontSize: 24, letterSpacing: '2px' }}>
               zp.minecanton209.pp.ua
            </div>
          </div>
        </div>
      ),
      {
        width: 1200, height: 630,
        fonts: [{ name: 'Oswald', data: fontData, style: 'normal', weight: 700 }],
      }
    );
  } catch (e) {
    return new Response(`Failed`, { status: 500 });
  }
}

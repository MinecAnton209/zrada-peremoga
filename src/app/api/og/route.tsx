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

    let bg = '#0f172a';
    let textColor = 'white';
    let accentColor = '#94a3b8';
    let status = 'ДЕРЖАВНИЙ РЕЄСТР';
    let emoji = '🇺🇦';
    
    if (resCode === '0') {
        bg = '#EAB308';
        textColor = '#000000';
        accentColor = '#713f12';
        status = 'ПЕРЕМОГА'; 
        emoji = '⚡️'; 
    }
    if (resCode === '1') {
        bg = '#DC2626';
        textColor = '#FFFFFF';
        accentColor = '#7f1d1d';
        status = 'ЗРАДА'; 
        emoji = '💔';
    }
    if (resCode === '2') {
        bg = '#000000';
        textColor = '#FACC15';
        accentColor = '#FFFFFF';
        status = 'ТОТАЛЬНА ПЕРЕМОГА'; 
        emoji = '🚀'; 
    }
    if (resCode === '3') {
        bg = '#000000';
        textColor = '#F87171';
        accentColor = '#FFFFFF';
        status = 'ТОТАЛЬНА ЗРАДА'; 
        emoji = '💀';
    }

    return new ImageResponse(
      (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          fontFamily: '"Oswald"',
          position: 'relative',
          overflow: 'hidden',
        }}>
          
          <div style={{
            position: 'absolute',
            fontSize: 500,
            opacity: 0.07,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}>
            {emoji}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            padding: '40px',
            textAlign: 'center',
          }}>
            
            <div style={{ 
                display: 'flex', 
                backgroundColor: textColor === '#000000' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                padding: '10px 30px',
                borderRadius: '50px',
                fontSize: 30, 
                fontWeight: 700,
                color: textColor,
                marginBottom: 20,
                letterSpacing: '4px',
            }}>
              {status}
            </div>

            <div style={{ 
              display: 'flex', 
              fontSize: query.length > 10 ? 110 : 160, 
              color: textColor,
              fontWeight: 700, 
              lineHeight: 0.9,
              marginBottom: 10,
              textTransform: 'uppercase',
            }}>
              {query}
            </div>

            <div style={{ 
              marginTop: 30,
              color: textColor,
              opacity: 0.6, 
              fontSize: 24, 
              letterSpacing: '2px' 
            }}>
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

import { Metadata } from 'next';
import MainGame from '@/components/MainGame';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zp.minecanton209.pp.ua';

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : undefined;
  const res = typeof params.res === 'string' ? params.res : undefined;

  if (q && res) {
    const ogUrl = new URL(`${BASE_URL}/api/og`);
    ogUrl.searchParams.set('query', q);
    ogUrl.searchParams.set('res', res);

    return {
      title: `${q.toUpperCase()} — Зрада чи Перемога?`,
      description: `Державний реєстр долі визначив статус для "${q}".`,
      openGraph: {
        title: `${q.toUpperCase()} — Результат перевірки`,
        description: 'Натисніть, щоб подивитися анімацію вердикту.',
        url: BASE_URL,
        siteName: 'Реєстр Долі',
        images: [
          {
            url: ogUrl.toString(),
            width: 1200,
            height: 630,
            alt: `Вердикт для ${q}`,
          },
        ],
        locale: 'uk_UA',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${q.toUpperCase()} — Вердикт`,
        images: [ogUrl.toString()],
      }
    };
  }

  return {
    title: "Реєстр Долі: Зрада чи Перемога?",
    description: "Державна система моніторингу всесвітнього балансу.",
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title: "Реєстр Долі",
      description: "Визнач свою долю за одну секунду.",
      images: [`${BASE_URL}/api/og?query=РЕЄСТР%20ДОЛІ&res=2`],
    },
  };
}

export default function Page() {
  return <MainGame />;
}

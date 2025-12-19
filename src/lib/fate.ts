import { FATE_CONFIG } from './config';

export function calculateFate(query: string) {
    const cleanQuery = query.trim().toLowerCase().slice(0, 30);
    if (!cleanQuery) return { code: 1, isTotal: false };

    const foundEntry = Object.entries(FATE_CONFIG.predefined).find(([key]) => cleanQuery.includes(key));
    if (foundEntry) {
        const code = foundEntry[1];
        return { code, isTotal: code >= 2 };
    }

    let sum = 0;
    for (let i = 0; i < cleanQuery.length; i++) sum += cleanQuery.charCodeAt(i);

    const isZrada = (sum % 10 >= 6);
    const isTotal = (sum % 100 === 99);

    if (isTotal) return isZrada ? { code: 3, isTotal: true } : { code: 2, isTotal: true };
    return isZrada ? { code: 1, isTotal: false } : { code: 0, isTotal: false };
}
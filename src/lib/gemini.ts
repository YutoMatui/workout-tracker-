const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface EstimatedFood {
  name: string;
  name_kana: string;
  kcal_per_100g: number;
  protein_g_per_100g: number;
  fat_g_per_100g: number;
  carb_g_per_100g: number;
}

export async function estimateFoodNutrition(name: string): Promise<EstimatedFood> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const prompt = `You are a nutrition expert specializing in Japanese cuisine.
Estimate typical nutritional content per 100g for the food: "${name}".

Return ONLY a valid JSON object with these exact fields (no markdown, no commentary):
{
  "name": "the food name in Japanese (formal/common form)",
  "name_kana": "hiragana reading",
  "kcal_per_100g": number,
  "protein_g_per_100g": number,
  "fat_g_per_100g": number,
  "carb_g_per_100g": number
}

If the input is ambiguous (e.g., "ラーメン"), assume the most common version (e.g., shoyu ramen).
For prepared dishes (e.g., 唐揚げ, ハンバーグ), give realistic per-100g values for the cooked finished dish.
For ingredients (e.g., 鶏むね肉), give raw or commonly-prepared values.
Round numbers to one decimal place.
Be realistic, not optimistic.`;

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 256,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response text from Gemini');

  try {
    const parsed = JSON.parse(text) as EstimatedFood;
    if (
      !parsed.name ||
      typeof parsed.kcal_per_100g !== 'number' ||
      typeof parsed.protein_g_per_100g !== 'number' ||
      typeof parsed.fat_g_per_100g !== 'number' ||
      typeof parsed.carb_g_per_100g !== 'number'
    ) {
      throw new Error('Invalid Gemini response shape');
    }
    return parsed;
  } catch (e: any) {
    throw new Error(`Failed to parse Gemini response: ${e.message}. Raw: ${text.slice(0, 200)}`);
  }
}

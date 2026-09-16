import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY = 'cardiovault-gemini-api-key';

export const getAiApiKey = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
};

export const setAiApiKey = (key: string): void => {
  try {
    const normalized = key.trim();
    if (normalized) localStorage.setItem(STORAGE_KEY, normalized);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures; the UI will report that no key is available.
  }
};

export const clearAiApiKey = (): void => setAiApiKey('');

const getClient = (): GoogleGenAI => {
  const apiKey = getAiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Add it in AI Settings.');
  }
  return new GoogleGenAI({ apiKey });
};

export const askClinicalAI = async (question: string, patientContext?: unknown): Promise<string> => {
  const ai = getClient();
  const context = patientContext
    ? `\n\nPatient clinical context (use only what is supplied; do not invent missing data):\n${JSON.stringify(patientContext, null, 2)}`
    : '';

  const prompt = `You are the CardioVault clinical documentation assistant for a physician.\n\nAnswer the physician's question clearly and concisely. Distinguish documented patient facts from clinical interpretation. Never invent vitals, labs, diagnoses, medications, or events. When information is insufficient, say exactly what is missing. This is decision support, not a substitute for bedside assessment or local protocols.\n\nPhysician question:\n${question}${context}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens: 1200,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('AI returned an empty response. Please try again.');
  return text;
};

export const analyzePatientWithAI = async (patientContext: unknown): Promise<string> => {
  return askClinicalAI(
    'Review this de-identified ICU/CCU record and provide: (1) concise clinical summary, (2) important abnormal or high-risk findings that are explicitly present, (3) missing information that would materially affect assessment, and (4) suggested topics to review on the next round. Do not make a definitive diagnosis or prescribe treatment.',
    patientContext,
  );
};

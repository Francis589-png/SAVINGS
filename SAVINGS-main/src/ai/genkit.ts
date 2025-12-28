import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyCg5MP8zf3cr3pKwfFkPRbe2QxE1KQxgI8"})],
  model: 'googleai/gemini-2.5-flash',
});

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyA24v4iWVhGzWcC6Kq7HJwBd008OK67jjM"})],
  model: 'googleai/gemini-2.5-flash',
});
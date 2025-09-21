import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-content-flow.ts';
import '@/ai/flows/get-trending-reports-flow.ts';
import '@/ai/flows/generate-reply-flow.ts';
import '@/ai/flows/game-flow.ts';
import '@/ai/flows/chatbot-flow.ts';
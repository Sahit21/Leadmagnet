import Vapi from '@vapi-ai/web';
import { AgentProfile } from '../types';

// Using the provided key. 
// Note: In a production environment, keys should be handled via secure backend proxies or environment variables.
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY || '756bcaa5-1b79-48a7-9559-a3915842d856';

// Using the provided public key for the Web SDK
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY || '4a2365a3-b1ca-4b95-aacc-15964c620aaa';

/**
 * Creates a new Assistant on Vapi via their API.
 * Requires VAPI_PRIVATE_KEY.
 */
export const createVapiAssistant = async (profile: AgentProfile): Promise<string> => {
  if (!VAPI_PRIVATE_KEY) {
    console.warn("VAPI_PRIVATE_KEY is missing. Cannot create assistant on Vapi backend.");
    throw new Error("VAPI_PRIVATE_KEY fehlt. Assistent kann nicht erstellt werden.");
  }

  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: profile.companyName,
      model: {
        provider: "google",
        model: "gemini-2.0-flash-exp", // Using the latest Gemini Flash model available on Vapi
        messages: [
            {
                role: "system",
                content: profile.systemInstruction
            }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - Standard American, works with Multilingual v2
        model: "eleven_multilingual_v2", // Essential for German support
        stability: 0.5,
        similarityBoost: 0.75
      },
      firstMessage: profile.welcomeMessage,
      transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "de"
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Vapi API Error: ${err.message || response.statusText}`);
  }

  const data = await response.json();
  return data.id;
};

/**
 * Vapi Web Client Wrapper
 */
export class VapiClient {
  private vapi: any;
  private statusHandler: (status: string) => void;
  private errorHandler: (error: string) => void;

  constructor(
    statusHandler: (status: string) => void,
    errorHandler: (error: string) => void
  ) {
    this.statusHandler = statusHandler;
    this.errorHandler = errorHandler;
    
    if (!VAPI_PUBLIC_KEY) {
      this.errorHandler("VAPI_PUBLIC_KEY fehlt.");
      return;
    }

    this.vapi = new Vapi(VAPI_PUBLIC_KEY);
    this.setupListeners();
  }

  private setupListeners() {
    this.vapi.on('call-start', () => {
      console.log('Vapi Call Started');
      this.statusHandler('connected');
    });

    this.vapi.on('call-end', () => {
      console.log('Vapi Call Ended');
      this.statusHandler('disconnected');
    });

    this.vapi.on('error', (e: any) => {
      console.error('Vapi Error', e);
      this.errorHandler(e.error?.message || "Ein Fehler ist aufgetreten.");
      this.statusHandler('error');
    });
    
    this.vapi.on('volume-level', (volume: number) => {
       // Volume level updates could be used for visualization here
    });
  }

  async start(assistantId: string) {
    try {
      this.statusHandler('connecting');
      await this.vapi.start(assistantId);
    } catch (e: any) {
      console.error("Failed to start Vapi call", e);
      this.errorHandler("Verbindung konnte nicht hergestellt werden. Überprüfen Sie den API-Schlüssel.");
      this.statusHandler('disconnected');
    }
  }

  stop() {
    if (this.vapi) {
        this.vapi.stop();
    }
  }
}
export enum AppStep {
  FORM = 'FORM',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  LIVE_DEMO = 'LIVE_DEMO'
}

export interface UserData {
  name: string;
  phone: string;
  email: string;
  website: string;
}

export interface AgentProfile {
  companyName: string;
  systemInstruction: string;
  welcomeMessage: string;
  vapiAssistantId?: string;
}

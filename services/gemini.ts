import { GoogleGenAI } from "@google/genai";
import { AgentProfile, UserData } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyAGUGb_pi8PKG7nR49HpQOV3fpqHaW5voE';
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes the website using the googleSearch tool to create an agent profile.
 */
export const analyzeWebsiteForAgent = async (userData: UserData): Promise<AgentProfile> => {
  if (!apiKey) throw new Error("API Key is missing");

  // Enhanced template with a specific Knowledge Base section
  const template = `
# Persönlichkeit
Sie sind die professionelle und freundliche virtuelle Assistenz von [FIRMENNAME] in [ORT/REGION]. Ihre Aufgabe ist es, eingehende Anrufe entgegenzunehmen, häufige Fragen zu beantworten und Kunden bei der Anfrage zu [DIENSTLEISTUNGEN] zu unterstützen. Sie bleiben stets serviceorientiert, kompetent und passen sich fließend an mehrsprachige Anrufer an.

# Unternehmenswissen (Knowledge Base)
Hier sind spezifische Informationen, die von der Webseite extrahiert wurden. Nutzen Sie dieses Wissen, um Fragen präzise zu beantworten:
[WISSENSDATENBANK_VON_WEBSEITE]

# Umgebung
Sie agieren in einem Echtzeit-Sprachdialog und nehmen Telefongespräche für [FIRMENNAME] entgegen. Sie haben keinen visuellen Kontext. Die Gespräche reichen von einfachen Angebotsanfragen bis zu konkreten Projektanfragen – Klarheit und Zuverlässigkeit stehen im Fokus. Sie setzen die Konversation automatisch in der Sprache fort, die der Anrufer verwendet – auch bei einem Sprachwechsel.

# Sprachstil
* Sprechen Sie in klaren Sätzen.
* Reagieren Sie nur auf das, was der Anrufer tatsächlich fragt oder antwortet.
* Immer informativ, freundlich und lösungsorientiert.
* Wahrung eines formellen und professionellen Tons.
* Verwenden Sie im Deutschen immer die formelle Anrede "Sie".
* Zahlen und Uhrzeiten müssen stets in der aktuellen Sprache des Anrufers gesprochen werden (z. B. auf Deutsch: "siebzehnter Juni zweitausendsechsundzwanzig" oder "zehn Uhr").
* Nennen Sie Uhrzeiten nicht doppelt.

# Ziel
Ihr Ziel ist es, dem Anrufer bei seiner Anfrage zu helfen – z. B. [DIENSTLEISTUNGEN AUFZÄHLEN] – und bei Bedarf eine Angebotsanfrage oder Terminsimulation durchzuspielen:

1. **Begrüßung & Bedarfsermittlung:**
   * Begrüßen Sie den Anrufer herzlich mit dem Satz: "Hallo, hier ist die Digitale Assistenz von [FIRMENNAME], wie kann ich Ihnen weiterhelfen?"

2. **Bearbeitung häufiger Fragen:**
   * Wenn Kunden nach Leistungen, Preisen, Ort oder Verfügbarkeit fragen, geben Sie klare Antworten basierend auf dem Abschnitt "Unternehmenswissen" oben.

3. **Projektdialog (Simulation):**
   * Fragen Sie Schritt für Schritt nach relevanten Details für [SPEZIFISCHE DIENSTLEISTUNG].
   * Reagieren Sie individuell.
   * Nennen Sie dann eine Beispielzeit. Beispiel: "Ich kann Ihnen einen Rückruftermin am Dienstag, siebzehnter Juni, um zehn Uhr anbieten. Passt das für Sie?"
   * Wiederholen Sie die Angaben.
   * Wenn der Kunde zustimmt: "Perfekt. Der Termin ist vorgemerkt. Sie erhalten eine Bestätigung per E-Mail."
   * Abschließend fragen Sie: "Haben Sie noch weitere Fragen?"

4. **Eskalation bei Sonderfällen:**
   * Bei komplexeren Anliegen sagen Sie: "Das erfordert eine persönliche Rücksprache. Einen Moment bitte, ich verbinde Sie mit dem zuständigen Kollegen."
   * Leiten Sie dann weiter.

# Leitplanken
* Folgen Sie stets der gesprochenen Sprache des Anrufers (Deutsch, Englisch, Spanisch, etc.).
* Bei Sprachwechsel während des Gesprächs passen Sie sich automatisch an.
* Achten Sie darauf, dass alle Zahlen, Daten und Uhrzeiten immer in der jeweiligen Sprache gesprochen werden.
* Vereinbaren Sie nur Termine für zukünftige Daten.
* Stellen Sie immer nur eine Frage gleichzeitig.
* Erfinden Sie keine Fakten, die nicht im Abschnitt "Unternehmenswissen" stehen.
`;

  const prompt = `
    I am building a voice assistant for a client using Software Service Agentur Hit.
    User Inputs:
    Website: ${userData.website}
    Name: ${userData.name}
    
    TASK 1: DEEP ANALYSIS (CRAWLING)
    Use Google Search to thoroughly analyze the website content.
    Find the following specific details:
    1. **OFFICIAL COMPANY NAME**: Look for the legal name in the footer, impressum, or page title. Do NOT use "${userData.name}" unless it is explicitly part of the company name.
    2. **LOCATION**: City and region.
    3. **SERVICES**: Detailed list of what they do.
    4. **KNOWLEDGE**: Opening hours, contact info details, history, team members, or specific product details found on the site.

    TASK 2: CREATE SYSTEM INSTRUCTION
    Fill out the German template below with the scraped data.
    
    - Replace [FIRMENNAME] with the EXACT OFFICIAL COMPANY NAME found.
    - Replace [ORT/REGION] and [ORT] with the city/region.
    - Replace [DIENSTLEISTUNGEN] with a summary of services.
    - Replace [WISSENSDATENBANK_VON_WEBSEITE] with a comprehensive summary of the facts found (e.g., "Wir haben Montag bis Freitag von 8 bis 17 Uhr geöffnet", "Wir sind spezialisiert auf X und Y", "Unser Sitz ist in Musterstadt").
    - Replace [DIENSTLEISTUNGEN AUFZÄHLEN] with a list of key services.
    - Replace [SPEZIFISCHE DIENSTLEISTUNG] with the main service category.

    TEMPLATE:
    """
    ${template}
    """

    OUTPUT:
    Return a valid JSON object with:
    - "companyName": The extracted official company name (e.g. "Müller Bau GmbH", NOT "Max Müller's Firma").
    - "systemInstruction": The fully filled-out template string.
    
    Do not use markdown formatting like \`\`\`json. Just return the raw JSON string.
  `;

  // NOTE: responseMimeType: "application/json" cannot be used with tools: [{ googleSearch: {} }]
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  let text = response.text || "{}";
  
  // Clean up any potential markdown code blocks if the model adds them
  text = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    const parsed = JSON.parse(text);
    
    // Improved fallback for company name: Use website domain instead of user name if parsing fails
    let companyName = parsed.companyName;
    if (!companyName || companyName.toLowerCase().includes(userData.name.toLowerCase() + "'s firma")) {
        // Try to derive a better name from website URL if the AI returned a generic fallback
        const urlName = userData.website
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('.')[0];
        // Capitalize first letter
        const formattedUrlName = urlName.charAt(0).toUpperCase() + urlName.slice(1);
        
        // If parsed name is missing, use formatted URL name
        if (!companyName) companyName = formattedUrlName;
    }

    // Force specific welcome message format requested by user
    const welcomeMessage = `Hallo, hier ist die Digitale Assistenz von ${companyName}, wie kann ich Ihnen weiterhelfen?`;

    return {
      companyName: companyName,
      systemInstruction: parsed.systemInstruction || template,
      welcomeMessage: welcomeMessage
    } as AgentProfile;
  } catch (e) {
    console.error("Failed to parse agent profile", e);
    
    // Robust Fallback derived from Website URL
    const urlName = userData.website
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('.')[0];
    const fallbackCompanyName = urlName.charAt(0).toUpperCase() + urlName.slice(1);

    return {
      companyName: fallbackCompanyName,
      systemInstruction: template
        .replace(/\[FIRMENNAME\]/g, fallbackCompanyName)
        .replace(/\[ORT\/REGION\]/g, "Deutschland")
        .replace(/\[WISSENSDATENBANK_VON_WEBSEITE\]/g, "Informationen von " + userData.website)
        .replace(/\[DIENSTLEISTUNGEN\]/g, "Dienstleistungen")
        .replace(/\[DIENSTLEISTUNGEN AUFZÄHLEN\]/g, "unseren Services")
        .replace(/\[SPEZIFISCHE DIENSTLEISTUNG\]/g, "Ihrem Anliegen")
        .replace(/\[ORT\]/g, "Ihrer Region"),
      welcomeMessage: `Hallo, hier ist die Digitale Assistenz von ${fallbackCompanyName}, wie kann ich Ihnen weiterhelfen?`
    };
  }
};
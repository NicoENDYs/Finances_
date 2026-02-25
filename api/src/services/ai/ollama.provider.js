export class OllamaProvider {
    constructor(baseUrl, model) {
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async complete(systemPrompt, userMessage) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}. ¿Está Ollama corriendo?`);
        }

        const data = await response.json();
        return data.message?.content || 'No pude generar una respuesta.';
    }
}

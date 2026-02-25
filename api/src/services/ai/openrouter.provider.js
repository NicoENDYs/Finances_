export class OpenRouterProvider {
    constructor(apiKey, model) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://openrouter.ai/api/v1';
    }

    async complete(systemPrompt, userMessage) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
                'X-Title': 'Aurora Finance',
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'No pude generar una respuesta.';
    }
}

import env from '../../config/env.js';
import { OpenRouterProvider } from './openrouter.provider.js';
import { OllamaProvider } from './ollama.provider.js';
import { getDashboardData, getSpendingByCategory } from '../analytics.service.js';

const providers = {
    openrouter: () => new OpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL),
    ollama: () => new OllamaProvider(env.OLLAMA_BASE_URL, env.OLLAMA_MODEL),
};

function getProvider(providerName = env.AI_PROVIDER) {
    const factory = providers[providerName];
    if (!factory) throw new Error(`AI provider "${providerName}" no soportado`);
    return factory();
}

function buildSystemPrompt(financialContext) {
    return `Eres Aurora AI, un asistente financiero personal inteligente y amigable para usuarios en Colombia.
Responde siempre en español colombiano, de forma concisa y útil. Usa emojis cuando sea apropiado.
Cuando menciones montos usa formato colombiano: $ X.XXX.XXX (pesos colombianos, COP).
No uses decimales para COP a menos que sea necesario.

CONTEXTO FINANCIERO DEL USUARIO:
${JSON.stringify(financialContext, null, 2)}

INSTRUCCIONES:
- Responde preguntas sobre gastos, ingresos, ahorro, inversiones, patrimonio neto y proyecciones basándote en los datos reales.
- Si el usuario pregunta por gastos en un comercio específico, busca en las transacciones recientes.
- Dale consejos prácticos y accionables basados en sus datos reales.
- Si no tienes datos suficientes para responder algo, indícalo honestamente.
- Sé breve pero informativo. Usa listas cuando ayude a la claridad.
- Nunca inventes datos que no estén en el contexto.`;
}

export async function chatWithAI(prisma, userId, userMessage) {
    const provider = getProvider();

    // Build financial context
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [dashboard, spending] = await Promise.all([
        getDashboardData(prisma, userId),
        getSpendingByCategory(prisma, userId, startOfMonth.toISOString(), endOfMonth.toISOString()),
    ]);

    const financialContext = {
        ...dashboard,
        currentSpending: spending,
        currentDate: now.toISOString().split('T')[0],
    };

    const systemPrompt = buildSystemPrompt(financialContext);
    const response = await provider.complete(systemPrompt, userMessage);

    return { response };
}

import { chatWithAI } from '../services/ai/ai.service.js';

export async function chat(request, reply) {
    const { message } = request.body;
    if (!message || !message.trim()) {
        return reply.status(400).send({ error: 'El mensaje no puede estar vacío' });
    }
    const result = await chatWithAI(request.server.prisma, request.user.id, message);
    reply.send(result);
}

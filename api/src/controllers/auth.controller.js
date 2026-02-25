import { registerUser, loginUser } from '../services/auth.service.js';

export async function register(request, reply) {
    const { email, name, password } = request.body;
    const user = await registerUser(request.server.prisma, { email, name, password });
    const token = request.server.jwt.sign({ id: user.id, email: user.email });
    reply.status(201).send({ user, token });
}

export async function login(request, reply) {
    const { email, password } = request.body;
    const user = await loginUser(request.server.prisma, { email, password });
    const token = request.server.jwt.sign({ id: user.id, email: user.email });
    reply.send({ user, token });
}

export async function me(request, reply) {
    const user = await request.server.prisma.user.findUnique({
        where: { id: request.user.id },
        select: { id: true, email: true, name: true, aiProvider: true, createdAt: true },
    });
    reply.send({ user });
}

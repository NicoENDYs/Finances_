import bcrypt from 'bcryptjs';

export async function registerUser(prisma, { email, name, password }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        const error = new Error('El email ya está registrado');
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { email, name, passwordHash },
        select: { id: true, email: true, name: true, createdAt: true },
    });

    return user;
}

export async function loginUser(prisma, { email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    return { id: user.id, email: user.email, name: user.name };
}

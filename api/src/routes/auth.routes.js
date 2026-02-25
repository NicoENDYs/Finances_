import * as authController from '../controllers/auth.controller.js';

export default async function authRoutes(fastify) {
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'name', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string', minLength: 2 },
                    password: { type: 'string', minLength: 6 },
                },
            },
        },
        handler: authController.register,
    });

    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
        },
        handler: authController.login,
    });

    fastify.get('/me', {
        onRequest: [fastify.authenticate],
        handler: authController.me,
    });
}

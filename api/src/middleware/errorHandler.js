import fp from 'fastify-plugin';

async function errorHandler(fastify) {
    fastify.setErrorHandler((error, request, reply) => {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Error interno del servidor';

        fastify.log.error({ err: error, requestId: request.id });

        reply.status(statusCode).send({
            error: true,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        });
    });
}

export default fp(errorHandler);

import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding database...\n');

    // Clean existing data
    await prisma.transaction.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.account.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create demo user
    const passwordHash = await bcrypt.hash('Nicolas$12', 12);
    const user = await prisma.user.create({
        data: { email: 'nico@gmail.com', name: 'Nicolás G.', passwordHash },
    });
    console.log(`✅ Usuario: ${user.email} (password: Nicolas$12)`);

    // Categories
    const categoriesData = [
        { name: 'Vivienda', icon: 'fa-home', color: '#06d6a0' },
        { name: 'Alimentación', icon: 'fa-utensils', color: '#00b4d8' },
        { name: 'Transporte', icon: 'fa-car', color: '#7c3aed' },
        { name: 'Suscripciones', icon: 'fa-tv', color: '#f59e0b' },
        { name: 'Entretenimiento', icon: 'fa-film', color: '#ef4444' },
        { name: 'Salud', icon: 'fa-heart-pulse', color: '#ec4899' },
        { name: 'Compras', icon: 'fa-shopping-bag', color: '#14b8a6' },
        { name: 'Educación', icon: 'fa-graduation-cap', color: '#8b5cf6' },
        { name: 'Ingreso', icon: 'fa-money-bill', color: '#22c55e' },
        { name: 'Otros', icon: 'fa-ellipsis', color: '#64748b' },
    ];
    const categories = {};
    for (const cat of categoriesData) {
        const c = await prisma.category.create({ data: cat });
        categories[c.name] = c;
    }
    console.log(`✅ ${categoriesData.length} categorías creadas`);


    console.log('\n✨ Seed completado! (Moneda: COP)\n');
}

seed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

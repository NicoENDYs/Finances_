import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding database...\n');

    // Clean existing data
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.account.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create demo user
    const passwordHash = await bcrypt.hash('aurora123', 12);
    const user = await prisma.user.create({
        data: { email: 'nicolas@aurora.app', name: 'Nicolás G.', passwordHash },
    });
    console.log(`✅ Usuario: ${user.email} (password: aurora123)`);

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

    // Accounts (COP - Colombian Pesos)
    const accountsData = [
        { name: 'Fondo Pensión Obligatoria', type: '401k', institution: 'Porvenir', balance: 45_000_000, color: '#06d6a0', icon: 'fa-shield-alt' },
        { name: 'Pensión Voluntaria', type: 'ira', institution: 'Skandia', balance: 18_500_000, color: '#7c3aed', icon: 'fa-gem' },
        { name: 'CDT Inversión', type: 'brokerage', institution: 'Bancolombia', balance: 25_000_000, color: '#00b4d8', icon: 'fa-chart-line' },
        { name: 'Crypto', type: 'crypto', institution: 'Binance', balance: 3_200_000, color: '#f59e0b', icon: 'fa-bitcoin' },
        { name: 'Cuenta Corriente', type: 'checking', institution: 'Bancolombia', balance: 5_800_000, color: '#3b82f6', icon: 'fa-money-check' },
        { name: 'Cuenta Ahorros', type: 'savings', institution: 'Davivienda', balance: 22_000_000, color: '#10b981', icon: 'fa-piggy-bank' },
        { name: 'Tarjeta Visa', type: 'credit', institution: 'Bancolombia', balance: -2_350_000, color: '#ef4444', icon: 'fa-credit-card' },
    ];
    const accounts = {};
    for (const acc of accountsData) {
        const a = await prisma.account.create({ data: { ...acc, userId: user.id, currency: 'COP' } });
        accounts[a.name] = a;
    }
    console.log(`✅ ${accountsData.length} cuentas creadas`);

    // Transactions (last 3 months - COP values)
    const now = new Date();
    const txData = [];

    // Recurring monthly income
    for (let m = 0; m < 3; m++) {
        const month = new Date(now.getFullYear(), now.getMonth() - m, 15);
        txData.push({ accountId: accounts['Cuenta Corriente'].id, categoryId: categories['Ingreso'].id, amount: 7_500_000, type: 'income', merchant: 'Nómina Empresa', date: month });
        txData.push({ accountId: accounts['Cuenta Corriente'].id, categoryId: categories['Ingreso'].id, amount: 2_500_000, type: 'income', merchant: 'Freelance', date: new Date(month.getTime() + 10 * 86400000) });
    }

    // Expenses this month (COP)
    const thisMonth = [
        { merchant: 'Arriendo Apartamento', cat: 'Vivienda', amount: 2_200_000, day: 1 },
        { merchant: 'Admin Edificio', cat: 'Vivienda', amount: 380_000, day: 1 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 2 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 22_000, day: 5 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 8 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 25_000, day: 12 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 15 },
        { merchant: 'Rappi', cat: 'Alimentación', amount: 45_000, day: 3 },
        { merchant: 'Rappi', cat: 'Alimentación', amount: 38_500, day: 10 },
        { merchant: 'Crepes & Waffles', cat: 'Alimentación', amount: 65_000, day: 7 },
        { merchant: 'Éxito Supermercado', cat: 'Alimentación', amount: 320_000, day: 6 },
        { merchant: 'Éxito Supermercado', cat: 'Alimentación', amount: 245_000, day: 14 },
        { merchant: 'Amazon Colombia', cat: 'Compras', amount: 189_000, day: 4 },
        { merchant: 'Falabella', cat: 'Compras', amount: 275_000, day: 11 },
        { merchant: 'Netflix', cat: 'Suscripciones', amount: 33_900, day: 1 },
        { merchant: 'Spotify', cat: 'Suscripciones', amount: 16_900, day: 1 },
        { merchant: 'ChatGPT Plus', cat: 'Suscripciones', amount: 85_000, day: 1 },
        { merchant: 'iCloud', cat: 'Suscripciones', amount: 12_900, day: 1 },
        { merchant: 'Terpel Gasolina', cat: 'Transporte', amount: 120_000, day: 5 },
        { merchant: 'Terpel Gasolina', cat: 'Transporte', amount: 135_000, day: 13 },
        { merchant: 'Uber', cat: 'Transporte', amount: 28_500, day: 9 },
        { merchant: 'Cine Colombia', cat: 'Entretenimiento', amount: 52_000, day: 8 },
        { merchant: 'PlayStation Store', cat: 'Entretenimiento', amount: 250_000, day: 12 },
        { merchant: 'Farmacia Pasteur', cat: 'Salud', amount: 85_000, day: 6 },
        { merchant: 'Bodytech Gym', cat: 'Salud', amount: 165_000, day: 1 },
        { merchant: 'Platzi', cat: 'Educación', amount: 99_000, day: 3 },
    ];

    for (const tx of thisMonth) {
        const date = new Date(now.getFullYear(), now.getMonth(), tx.day);
        if (date <= now) {
            txData.push({
                accountId: accounts['Cuenta Corriente'].id,
                categoryId: categories[tx.cat].id,
                amount: tx.amount, type: 'expense', merchant: tx.merchant, date,
            });
        }
    }

    // Last month (COP)
    const lastMonthExpenses = [
        { merchant: 'Arriendo Apartamento', cat: 'Vivienda', amount: 2_200_000, day: 1 },
        { merchant: 'Admin Edificio', cat: 'Vivienda', amount: 380_000, day: 1 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 3 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 7 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 22_000, day: 11 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 14 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 18 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 25_000, day: 22 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 26 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 18_500, day: 28 },
        { merchant: 'Rappi', cat: 'Alimentación', amount: 52_000, day: 5 },
        { merchant: 'Éxito Supermercado', cat: 'Alimentación', amount: 385_000, day: 8 },
        { merchant: 'Éxito Supermercado', cat: 'Alimentación', amount: 298_000, day: 20 },
        { merchant: 'Netflix', cat: 'Suscripciones', amount: 33_900, day: 1 },
        { merchant: 'Spotify', cat: 'Suscripciones', amount: 16_900, day: 1 },
        { merchant: 'Terpel Gasolina', cat: 'Transporte', amount: 115_000, day: 4 },
        { merchant: 'Terpel Gasolina', cat: 'Transporte', amount: 128_000, day: 16 },
        { merchant: 'Amazon Colombia', cat: 'Compras', amount: 345_000, day: 10 },
        { merchant: 'Bodytech Gym', cat: 'Salud', amount: 165_000, day: 1 },
    ];

    for (const tx of lastMonthExpenses) {
        const date = new Date(now.getFullYear(), now.getMonth() - 1, tx.day);
        txData.push({
            accountId: accounts['Cuenta Corriente'].id,
            categoryId: categories[tx.cat].id,
            amount: tx.amount, type: 'expense', merchant: tx.merchant, date,
        });
    }

    for (const tx of txData) {
        await prisma.transaction.create({ data: tx });
    }
    console.log(`✅ ${txData.length} transacciones creadas`);

    // Goals (COP)
    const goalsData = [
        { name: 'Fondo de Emergencia', targetAmount: 30_000_000, currentAmount: 15_000_000, color: '#06d6a0' },
        { name: 'Vacaciones Europa', targetAmount: 12_000_000, currentAmount: 5_800_000, color: '#00b4d8' },
        { name: 'Cuota Inicial Apto', targetAmount: 80_000_000, currentAmount: 22_000_000, color: '#7c3aed' },
        { name: 'MacBook Pro', targetAmount: 10_000_000, currentAmount: 7_200_000, color: '#f59e0b' },
    ];
    for (const g of goalsData) {
        await prisma.goal.create({ data: { ...g, userId: user.id } });
    }
    console.log(`✅ ${goalsData.length} metas creadas`);

    // Budgets (COP)
    const budgetsData = [
        { categoryId: categories['Alimentación'].id, amount: 1_200_000 },
        { categoryId: categories['Transporte'].id, amount: 400_000 },
        { categoryId: categories['Entretenimiento'].id, amount: 350_000 },
        { categoryId: categories['Suscripciones'].id, amount: 200_000 },
        { categoryId: categories['Compras'].id, amount: 500_000 },
    ];
    for (const b of budgetsData) {
        await prisma.budget.create({ data: { ...b, userId: user.id, period: 'monthly' } });
    }
    console.log(`✅ ${budgetsData.length} presupuestos creados`);

    console.log('\n✨ Seed completado! (Moneda: COP)\n');
}

seed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

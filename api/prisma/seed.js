import { PrismaClient } from '@prisma/client';
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

    // Accounts
    const accountsData = [
        { name: '401(k) Employer', type: '401k', institution: 'Fidelity', balance: 89420, color: '#06d6a0', icon: 'fa-shield-alt' },
        { name: 'Roth IRA', type: 'ira', institution: 'Vanguard', balance: 34650, color: '#7c3aed', icon: 'fa-gem' },
        { name: 'Brokerage', type: 'brokerage', institution: 'Charles Schwab', balance: 52180, color: '#00b4d8', icon: 'fa-chart-line' },
        { name: 'Crypto', type: 'crypto', institution: 'Coinbase', balance: 8320, color: '#f59e0b', icon: 'fa-bitcoin' },
        { name: 'Checking', type: 'checking', institution: 'Chase', balance: 12840, color: '#3b82f6', icon: 'fa-money-check' },
        { name: 'Savings', type: 'savings', institution: 'Chase', balance: 48422, color: '#10b981', icon: 'fa-piggy-bank' },
        { name: 'Visa Platinum', type: 'credit', institution: 'Chase', balance: -1578, color: '#ef4444', icon: 'fa-credit-card' },
    ];
    const accounts = {};
    for (const acc of accountsData) {
        const a = await prisma.account.create({ data: { ...acc, userId: user.id } });
        accounts[a.name] = a;
    }
    console.log(`✅ ${accountsData.length} cuentas creadas`);

    // Transactions (last 3 months)
    const now = new Date();
    const txData = [];

    // Recurring monthly income
    for (let m = 0; m < 3; m++) {
        const month = new Date(now.getFullYear(), now.getMonth() - m, 15);
        txData.push({ accountId: accounts['Checking'].id, categoryId: categories['Ingreso'].id, amount: 4250, type: 'income', merchant: 'Nómina Empresa', date: month });
        txData.push({ accountId: accounts['Checking'].id, categoryId: categories['Ingreso'].id, amount: 800, type: 'income', merchant: 'Freelance', date: new Date(month.getTime() + 10 * 86400000) });
    }

    // Expenses this month
    const thisMonth = [
        { merchant: 'Arriendo', cat: 'Vivienda', amount: 1200, day: 1 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 2 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 6.20, day: 5 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 8 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 7.50, day: 12 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 15 },
        { merchant: 'Uber Eats', cat: 'Alimentación', amount: 32.50, day: 3 },
        { merchant: 'Uber Eats', cat: 'Alimentación', amount: 28.90, day: 10 },
        { merchant: 'Chipotle', cat: 'Alimentación', amount: 14.30, day: 7 },
        { merchant: 'Supermercado Éxito', cat: 'Alimentación', amount: 156.80, day: 6 },
        { merchant: 'Supermercado Éxito', cat: 'Alimentación', amount: 98.40, day: 14 },
        { merchant: 'Amazon', cat: 'Compras', amount: 67.99, day: 4 },
        { merchant: 'Amazon', cat: 'Compras', amount: 34.99, day: 11 },
        { merchant: 'Netflix', cat: 'Suscripciones', amount: 15.99, day: 1 },
        { merchant: 'Spotify', cat: 'Suscripciones', amount: 9.99, day: 1 },
        { merchant: 'ChatGPT Plus', cat: 'Suscripciones', amount: 20.00, day: 1 },
        { merchant: 'iCloud', cat: 'Suscripciones', amount: 2.99, day: 1 },
        { merchant: 'Shell Gasolina', cat: 'Transporte', amount: 48.20, day: 5 },
        { merchant: 'Shell Gasolina', cat: 'Transporte', amount: 52.10, day: 13 },
        { merchant: 'Uber', cat: 'Transporte', amount: 18.50, day: 9 },
        { merchant: 'Cine Colombia', cat: 'Entretenimiento', amount: 24.00, day: 8 },
        { merchant: 'PlayStation Store', cat: 'Entretenimiento', amount: 59.99, day: 12 },
        { merchant: 'Farmacia', cat: 'Salud', amount: 35.60, day: 6 },
        { merchant: 'Gym Bodytech', cat: 'Salud', amount: 45.00, day: 1 },
        { merchant: 'Coursera', cat: 'Educación', amount: 39.99, day: 3 },
    ];

    for (const tx of thisMonth) {
        const date = new Date(now.getFullYear(), now.getMonth(), tx.day);
        if (date <= now) {
            txData.push({
                accountId: accounts['Checking'].id,
                categoryId: categories[tx.cat].id,
                amount: tx.amount, type: 'expense', merchant: tx.merchant, date,
            });
        }
    }

    // Last month similar pattern
    const lastMonthExpenses = [
        { merchant: 'Arriendo', cat: 'Vivienda', amount: 1200, day: 1 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 3 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 7 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 6.80, day: 11 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 14 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 18 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 7.20, day: 22 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 26 },
        { merchant: 'Starbucks', cat: 'Alimentación', amount: 5.40, day: 28 },
        { merchant: 'DoorDash', cat: 'Alimentación', amount: 54.30, day: 5 },
        { merchant: 'Supermercado Éxito', cat: 'Alimentación', amount: 178.40, day: 8 },
        { merchant: 'Supermercado Éxito', cat: 'Alimentación', amount: 134.20, day: 20 },
        { merchant: 'Netflix', cat: 'Suscripciones', amount: 15.99, day: 1 },
        { merchant: 'Spotify', cat: 'Suscripciones', amount: 9.99, day: 1 },
        { merchant: 'Shell Gasolina', cat: 'Transporte', amount: 45.80, day: 4 },
        { merchant: 'Shell Gasolina', cat: 'Transporte', amount: 50.20, day: 16 },
        { merchant: 'Amazon', cat: 'Compras', amount: 129.99, day: 10 },
        { merchant: 'Gym Bodytech', cat: 'Salud', amount: 45.00, day: 1 },
    ];

    for (const tx of lastMonthExpenses) {
        const date = new Date(now.getFullYear(), now.getMonth() - 1, tx.day);
        txData.push({
            accountId: accounts['Checking'].id,
            categoryId: categories[tx.cat].id,
            amount: tx.amount, type: 'expense', merchant: tx.merchant, date,
        });
    }

    for (const tx of txData) {
        await prisma.transaction.create({ data: tx });
    }
    console.log(`✅ ${txData.length} transacciones creadas`);

    // Goals
    const goalsData = [
        { name: 'Fondo de Emergencia', targetAmount: 15000, currentAmount: 8500, color: '#06d6a0' },
        { name: 'Vacaciones Europa', targetAmount: 5000, currentAmount: 3200, color: '#00b4d8' },
        { name: 'Enganche Casa', targetAmount: 60000, currentAmount: 22000, color: '#7c3aed' },
        { name: 'MacBook Pro', targetAmount: 2500, currentAmount: 1800, color: '#f59e0b' },
    ];
    for (const g of goalsData) {
        await prisma.goal.create({ data: { ...g, userId: user.id } });
    }
    console.log(`✅ ${goalsData.length} metas creadas`);

    // Budgets
    const budgetsData = [
        { categoryId: categories['Alimentación'].id, amount: 600 },
        { categoryId: categories['Transporte'].id, amount: 200 },
        { categoryId: categories['Entretenimiento'].id, amount: 150 },
        { categoryId: categories['Suscripciones'].id, amount: 60 },
        { categoryId: categories['Compras'].id, amount: 200 },
    ];
    for (const b of budgetsData) {
        await prisma.budget.create({ data: { ...b, userId: user.id, period: 'monthly' } });
    }
    console.log(`✅ ${budgetsData.length} presupuestos creados`);

    console.log('\n✨ Seed completado!\n');
}

seed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

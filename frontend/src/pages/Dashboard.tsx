import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useAuthStore } from '../store/authStore';
import { Line, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);

const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
    const { user } = useAuthStore();
    const { data, accounts, isLoading, fetchDashboard, fetchAccounts } = useDashboardStore();

    useEffect(() => {
        fetchDashboard();
        fetchAccounts();
    }, []);

    if (isLoading || !data) {
        return <div className="dashboard-loading">Cargando tu panorama financiero...</div>;
    }

    const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

    const accountsByType: Record<string, any[]> = {};
    accounts.forEach((a: any) => {
        const group = ['401k', 'ira'].includes(a.type) ? 'Jubilación'
            : ['brokerage', 'crypto'].includes(a.type) ? 'Inversiones' : 'Banco & Gasto';
        if (!accountsByType[group]) accountsByType[group] = [];
        accountsByType[group].push(a);
    });

    const groupIcons: Record<string, string> = { Jubilación: 'fa-university', Inversiones: 'fa-chart-bar', 'Banco & Gasto': 'fa-credit-card' };

    return (
        <div className="dashboard">
            <div className="dash-header">
                <div>
                    <h1>{greeting}, <span className="text-accent">{user?.name?.split(' ')[0]}</span></h1>
                    <p className="text-muted">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid">
                <div className="card kpi-card fade-up">
                    <div className="kpi-header">
                        <div className="icon-box icon-green"><i className="fas fa-landmark" /></div>
                        <span className="badge badge-green"><i className="fas fa-arrow-up" /> +3.2%</span>
                    </div>
                    <div className="kpi-value">{formatCOP(data.netWorth.netWorth)}</div>
                    <div className="kpi-label text-muted">Patrimonio neto</div>
                </div>
                <div className="card kpi-card fade-up" style={{ animationDelay: '.07s' }}>
                    <div className="kpi-header">
                        <div className="icon-box icon-blue"><i className="fas fa-credit-card" /></div>
                        <span className="badge badge-red"><i className="fas fa-arrow-up" /> +8.1%</span>
                    </div>
                    <div className="kpi-value">{formatCOP(data.monthly.totalExpenses)}</div>
                    <div className="kpi-label text-muted">Gasto mensual</div>
                </div>
                <div className="card kpi-card fade-up" style={{ animationDelay: '.14s' }}>
                    <div className="kpi-header">
                        <div className="icon-box icon-purple"><i className="fas fa-piggy-bank" /></div>
                        <span className="badge badge-green"><i className="fas fa-arrow-up" /> +2.5%</span>
                    </div>
                    <div className="kpi-value">{data.monthly.savingsRate}%</div>
                    <div className="kpi-label text-muted">Tasa de ahorro</div>
                </div>
                <div className="card kpi-card fade-up" style={{ animationDelay: '.21s' }}>
                    <div className="kpi-header">
                        <div className="icon-box icon-yellow"><i className="fas fa-chart-line" /></div>
                        <span className="badge badge-green"><i className="fas fa-arrow-up" /> +12.4%</span>
                    </div>
                    <div className="kpi-value">{formatCOP(data.monthly.savings)}</div>
                    <div className="kpi-label text-muted">Ahorro este mes</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="card fade-up">
                    <h3><i className="fas fa-chart-area text-accent" /> Patrimonio Neto — Últimos 12 Meses</h3>
                    <Line
                        data={{
                            labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
                            datasets: [{
                                label: 'Patrimonio',
                                data: [85_000_000, 88_500_000, 91_200_000, 93_800_000, 96_500_000, 99_000_000, 102_000_000, 105_500_000, 108_000_000, 111_500_000, 114_800_000, Number(data.netWorth.netWorth)],
                                fill: true,
                                backgroundColor: 'rgba(6,214,160,0.1)',
                                borderColor: '#06d6a0',
                                borderWidth: 2.5,
                                tension: 0.4,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                            }],
                        }}
                        options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { grid: { display: false }, ticks: { color: '#64748b' } },
                                y: { ticks: { color: '#64748b', callback: (v: any) => '$' + (Number(v) / 1_000_000).toFixed(0) + 'M' }, grid: { color: 'rgba(255,255,255,.04)' } },
                            },
                        }}
                    />
                </div>
                <div className="card fade-up">
                    <h3><i className="fas fa-chart-pie text-accent" /> Gastos por Categoría</h3>
                    {data.spendingByCategory.length > 0 ? (
                        <Doughnut
                            data={{
                                labels: data.spendingByCategory.map((s: any) => s.category.name),
                                datasets: [{
                                    data: data.spendingByCategory.map((s: any) => s.total),
                                    backgroundColor: data.spendingByCategory.map((s: any) => s.category.color),
                                    borderWidth: 0,
                                    hoverOffset: 8,
                                }],
                            }}
                            options={{
                                responsive: true,
                                cutout: '68%',
                                plugins: {
                                    legend: { position: 'bottom' as const, labels: { color: '#94a3b8', padding: 14, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } },
                                },
                            }}
                        />
                    ) : <p className="text-muted">Sin gastos este mes</p>}
                </div>
            </div>

            {/* Accounts */}
            <div className="accounts-grid">
                {Object.entries(accountsByType).map(([group, accs]) => (
                    <div className="card fade-up" key={group}>
                        <h3><i className={`fas ${groupIcons[group]} text-accent`} /> {group}</h3>
                        {accs.map((a: any) => (
                            <div className="account-item" key={a.id}>
                                <div className={`icon-box ${Number(a.balance) < 0 ? 'icon-red' : 'icon-green'}`}>
                                    <i className={`fas ${a.icon}`} />
                                </div>
                                <div className="acc-info">
                                    <div className="acc-name">{a.name}</div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>{a.institution}</div>
                                </div>
                                <div className={`acc-balance ${Number(a.balance) < 0 ? 'text-danger' : ''}`}>
                                    {formatCOP(Number(a.balance))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Transactions & Goals */}
            <div className="bottom-grid">
                <div className="card fade-up">
                    <h3><i className="fas fa-receipt text-accent" /> Transacciones Recientes</h3>
                    {data.recentTransactions.map((tx: any) => (
                        <div className="tx-item" key={tx.id}>
                            <div className={`icon-box ${tx.type === 'income' ? 'icon-green' : 'icon-blue'}`}>
                                <i className={`fas ${tx.category.icon}`} />
                            </div>
                            <div className="tx-info">
                                <div className="tx-merchant">{tx.merchant}</div>
                                <div className="text-muted" style={{ fontSize: 12 }}>{tx.category.name}</div>
                            </div>
                            <div className={`tx-amount ${tx.type === 'expense' ? 'text-danger' : 'text-accent'}`}>
                                {tx.type === 'expense' ? '-' : '+'}{formatCOP(Number(tx.amount))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card fade-up">
                    <h3><i className="fas fa-bullseye text-accent" /> Metas de Ahorro</h3>
                    {data.goals.map((g: any) => {
                        const pct = Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100);
                        return (
                            <div className="goal-item" key={g.id}>
                                <div className="goal-header">
                                    <span>{g.name}</span>
                                    <span className="text-accent">{pct}% · {formatCOP(Number(g.currentAmount))} / {formatCOP(Number(g.targetAmount))}</span>
                                </div>
                                <div className="goal-bar">
                                    <div className="goal-fill" style={{ width: `${pct}%`, background: g.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Investments.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Investments() {
    const { accounts, fetchAccounts } = useDashboardStore();

    useEffect(() => { fetchAccounts(); }, []);

    const investmentTypes = ['401k', 'ira', 'brokerage', 'crypto'];
    const investmentAccounts = accounts.filter((a: any) => investmentTypes.includes(a.type));
    const totalInvested = investmentAccounts.reduce((s: number, a: any) => s + Number(a.balance), 0);

    const typeLabels: Record<string, string> = { '401k': 'Pensión Obligatoria', ira: 'Pensión Voluntaria', brokerage: 'Inversión / CDT', crypto: 'Criptomonedas' };
    const typeColors: Record<string, string> = { '401k': '#06d6a0', ira: '#7c3aed', brokerage: '#00b4d8', crypto: '#f59e0b' };

    // Group by type
    const byType: Record<string, number> = {};
    investmentAccounts.forEach((a: any) => {
        byType[a.type] = (byType[a.type] || 0) + Number(a.balance);
    });

    // Simulated returns
    const simulatedReturns = [
        { label: '1 mes', rate: 0.8 },
        { label: '3 meses', rate: 2.5 },
        { label: '6 meses', rate: 5.2 },
        { label: '1 año', rate: 11.4 },
    ];

    return (
        <div className="investments-page">
            <div className="page-header">
                <div>
                    <h1>Inversiones</h1>
                    <p className="text-muted">{investmentAccounts.length} cuentas de inversión</p>
                </div>
            </div>

            {/* Summary */}
            <div className="invest-summary-row">
                <div className="card summary-card">
                    <div className="icon-box icon-green"><i className="fas fa-chart-line" /></div>
                    <div><div className="summary-value">{formatCOP(totalInvested)}</div><div className="text-muted" style={{ fontSize: 13 }}>Portfolio Total</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-purple"><i className="fas fa-percentage" /></div>
                    <div><div className="summary-value text-accent">+11.4%</div><div className="text-muted" style={{ fontSize: 13 }}>Retorno Anual Est.</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-yellow"><i className="fas fa-coins" /></div>
                    <div><div className="summary-value">{investmentAccounts.length}</div><div className="text-muted" style={{ fontSize: 13 }}>Cuentas Activas</div></div>
                </div>
            </div>

            {/* Charts + Allocation */}
            <div className="invest-charts">
                <div className="card fade-up">
                    <h3><i className="fas fa-chart-pie text-accent" /> Distribución del Portfolio</h3>
                    {Object.keys(byType).length > 0 ? (
                        <div className="donut-container">
                            <Doughnut
                                data={{
                                    labels: Object.keys(byType).map(t => typeLabels[t] || t),
                                    datasets: [{
                                        data: Object.values(byType),
                                        backgroundColor: Object.keys(byType).map(t => typeColors[t] || '#64748b'),
                                        borderWidth: 0,
                                        hoverOffset: 8,
                                    }],
                                }}
                                options={{
                                    responsive: true,
                                    cutout: '65%',
                                    plugins: {
                                        legend: { position: 'bottom' as const, labels: { color: '#94a3b8', padding: 14, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } },
                                    },
                                }}
                            />
                        </div>
                    ) : <p className="text-muted">Sin inversiones</p>}
                </div>

                <div className="card fade-up">
                    <h3><i className="fas fa-calculator text-accent" /> Proyección de Retornos</h3>
                    <div className="returns-list">
                        {simulatedReturns.map((r) => (
                            <div className="return-item" key={r.label}>
                                <div className="return-label">{r.label}</div>
                                <div className="return-pct text-accent">+{r.rate}%</div>
                                <div className="return-value">{formatCOP(totalInvested * (1 + r.rate / 100))}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Account detail cards */}
            <h2 className="section-title"><i className="fas fa-wallet text-accent" /> Detalle por Cuenta</h2>
            <div className="invest-accounts-grid">
                {investmentAccounts.map((a: any) => {
                    const pctOfPortfolio = totalInvested > 0 ? Math.round((Number(a.balance) / totalInvested) * 100) : 0;
                    return (
                        <div className="card invest-account-card fade-up" key={a.id}>
                            <div className="invest-acc-header">
                                <div className="icon-box" style={{ background: `${a.color}18`, color: a.color }}>
                                    <i className={`fas ${a.icon}`} />
                                </div>
                                <span className="invest-pct-badge" style={{ background: `${a.color}18`, color: a.color }}>{pctOfPortfolio}%</span>
                            </div>
                            <h4>{a.name}</h4>
                            <div className="invest-acc-inst text-muted">{a.institution} · {typeLabels[a.type] || a.type}</div>
                            <div className="invest-acc-balance">{formatCOP(Number(a.balance))}</div>
                            <div className="invest-alloc-bar">
                                <div className="invest-alloc-fill" style={{ width: `${pctOfPortfolio}%`, background: a.color }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { budgetsApi } from '../api';
import './Budgets.css';

const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Budgets() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const { data } = await budgetsApi.list();
            setBudgets(data.budgets);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBudgets(); }, []);

    const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    return (
        <div className="budgets-page">
            <div className="page-header">
                <div>
                    <h1>Presupuestos</h1>
                    <p className="text-muted">Control de gastos mensuales por categoría</p>
                </div>
            </div>

            {/* Summary */}
            <div className="budget-summary-row">
                <div className="card summary-card">
                    <div className="icon-box icon-blue"><i className="fas fa-wallet" /></div>
                    <div><div className="summary-value">{formatCOP(totalBudget)}</div><div className="text-muted" style={{ fontSize: 13 }}>Presupuesto Total</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-red"><i className="fas fa-receipt" /></div>
                    <div><div className="summary-value text-danger">{formatCOP(totalSpent)}</div><div className="text-muted" style={{ fontSize: 13 }}>Gastado</div></div>
                </div>
                <div className="card summary-card">
                    <div className={`icon-box ${totalRemaining >= 0 ? 'icon-green' : 'icon-red'}`}><i className="fas fa-piggy-bank" /></div>
                    <div><div className={`summary-value ${totalRemaining >= 0 ? 'text-accent' : 'text-danger'}`}>{formatCOP(totalRemaining)}</div><div className="text-muted" style={{ fontSize: 13 }}>Disponible</div></div>
                </div>
            </div>

            {/* Overall progress */}
            <div className="card overall-progress fade-up">
                <div className="overall-header">
                    <h3><i className="fas fa-chart-bar text-accent" /> Progreso General</h3>
                    <span className="text-muted">{Math.round((totalSpent / totalBudget) * 100)}% del presupuesto</span>
                </div>
                <div className="overall-bar">
                    <div
                        className={`overall-fill ${(totalSpent / totalBudget) > 0.9 ? 'danger' : (totalSpent / totalBudget) > 0.7 ? 'warning' : ''}`}
                        style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
                    />
                </div>
                <div className="overall-labels">
                    <span>{formatCOP(totalSpent)} gastado</span>
                    <span>{formatCOP(totalBudget)} presupuestado</span>
                </div>
            </div>

            {/* Budget cards */}
            {loading ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Cargando presupuestos...</p>
            ) : (
                <div className="budget-grid">
                    {budgets.map((b) => {
                        const pct = totalBudget > 0 ? Math.round((b.spent / Number(b.amount)) * 100) : 0;
                        const status = pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'ok';

                        return (
                            <div className={`card budget-card fade-up ${status}`} key={b.id}>
                                <div className="budget-card-header">
                                    <div className="icon-box" style={{ background: `${b.category.color}18`, color: b.category.color }}>
                                        <i className={`fas ${b.category.icon}`} />
                                    </div>
                                    <span className={`budget-pct ${status}`}>{pct}%</span>
                                </div>
                                <h4>{b.category.name}</h4>
                                <div className="budget-amounts">
                                    <span className={status === 'over' ? 'text-danger' : ''}>{formatCOP(b.spent)}</span>
                                    <span className="text-muted"> / {formatCOP(Number(b.amount))}</span>
                                </div>
                                <div className="budget-bar">
                                    <div
                                        className={`budget-fill ${status}`}
                                        style={{ width: `${Math.min(100, pct)}%`, background: status === 'over' ? 'var(--danger)' : status === 'warning' ? 'var(--warning)' : b.category.color }}
                                    />
                                </div>
                                <div className="budget-remaining text-muted">
                                    {Number(b.amount) - b.spent >= 0
                                        ? `${formatCOP(Number(b.amount) - b.spent)} disponible`
                                        : `${formatCOP(b.spent - Number(b.amount))} excedido`
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

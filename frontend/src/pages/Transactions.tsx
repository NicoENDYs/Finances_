import { useEffect, useState } from 'react';
import { transactionsApi } from '../api';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import './Transactions.css';

const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Transactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const confirm = useConfirm();
    const toast = useToast();

    const fetchTx = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { limit: '100' };
            if (search) params.merchant = search;
            if (typeFilter) params.type = typeFilter;
            const { data } = await transactionsApi.list(params);
            setTransactions(data.transactions);
            setTotal(data.total);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTx(); }, [typeFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTx();
    };

    const handleDelete = async (id: number, merchant: string) => {
        const ok = await confirm({
            title: 'Eliminar transacción',
            message: `¿Eliminar la transacción de "${merchant}"?`,
            confirmText: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            await transactionsApi.remove(id);
            fetchTx();
            toast('Transacción eliminada');
        } catch { toast('Error al eliminar', 'error'); }
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    return (
        <div className="transactions-page">
            <div className="page-header">
                <div>
                    <h1>Transacciones</h1>
                    <p className="text-muted">{total} transacciones encontradas</p>
                </div>
            </div>

            <div className="tx-summary-row">
                <div className="card summary-card">
                    <div className="icon-box icon-green"><i className="fas fa-arrow-down" /></div>
                    <div><div className="summary-value text-accent">{formatCOP(totalIncome)}</div><div className="text-muted" style={{ fontSize: 13 }}>Ingresos</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-red"><i className="fas fa-arrow-up" /></div>
                    <div><div className="summary-value text-danger">{formatCOP(totalExpense)}</div><div className="text-muted" style={{ fontSize: 13 }}>Gastos</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-blue"><i className="fas fa-exchange-alt" /></div>
                    <div><div className="summary-value">{formatCOP(totalIncome - totalExpense)}</div><div className="text-muted" style={{ fontSize: 13 }}>Balance</div></div>
                </div>
            </div>

            <div className="tx-filters card">
                <form onSubmit={handleSearch} className="filter-bar">
                    <div className="search-box">
                        <i className="fas fa-search" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por comercio (Starbucks, Rappi...)" />
                    </div>
                    <div className="filter-chips">
                        {['', 'expense', 'income'].map((t) => (
                            <button key={t} type="button" className={`filter-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
                                {t === '' ? 'Todos' : t === 'expense' ? 'Gastos' : 'Ingresos'}
                            </button>
                        ))}
                    </div>
                    <button type="submit" className="btn-search">Buscar</button>
                </form>
            </div>

            <div className="card tx-list-card">
                {loading ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Cargando transacciones...</p>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-receipt" />
                        <p>No se encontraron transacciones</p>
                    </div>
                ) : (
                    <table className="tx-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Comercio</th>
                                <th>Categoría</th>
                                <th>Cuenta</th>
                                <th style={{ textAlign: 'right' }}>Monto</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="tx-row">
                                    <td className="tx-date">{formatDate(tx.date)}</td>
                                    <td>
                                        <div className="tx-merchant-cell">
                                            <div className={`icon-box-sm ${tx.type === 'income' ? 'icon-green' : ''}`} style={tx.type !== 'income' ? { background: `${tx.category.color}18`, color: tx.category.color } : {}}>
                                                <i className={`fas ${tx.category.icon}`} />
                                            </div>
                                            <span className="tx-merchant-name">{tx.merchant}</span>
                                        </div>
                                    </td>
                                    <td><span className="tx-cat-badge" style={{ background: `${tx.category.color}18`, color: tx.category.color }}>{tx.category.name}</span></td>
                                    <td className="text-muted" style={{ fontSize: 13 }}>{tx.account?.name}</td>
                                    <td className={`tx-amount-cell ${tx.type === 'expense' ? 'text-danger' : 'text-accent'}`}>
                                        {tx.type === 'expense' ? '-' : '+'}{formatCOP(Number(tx.amount))}
                                    </td>
                                    <td>
                                        <button className="tx-delete-btn" onClick={() => handleDelete(tx.id, tx.merchant)} title="Eliminar">
                                            <i className="fas fa-trash-alt" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

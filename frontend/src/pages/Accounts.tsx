import { useEffect, useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { accountsApi } from '../api';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import './Accounts.css';

const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const typeLabels: Record<string, string> = {
    checking: 'Cuenta Corriente', savings: 'Cuenta Ahorros', credit: 'Tarjeta de Crédito',
    '401k': 'Pensión Obligatoria', ira: 'Pensión Voluntaria', brokerage: 'Inversión / CDT', crypto: 'Criptomonedas',
};

const typeGroups: Record<string, string[]> = {
    'Jubilación': ['401k', 'ira'],
    'Inversiones': ['brokerage', 'crypto'],
    'Banco & Gasto': ['checking', 'savings', 'credit'],
};

export default function Accounts() {
    const { accounts, fetchAccounts } = useDashboardStore();
    const confirm = useConfirm();
    const toast = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'checking', institution: '', balance: 0, color: '#06d6a0', icon: 'fa-university' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchAccounts(); }, []);

    const totalAssets = accounts.filter((a: any) => a.type !== 'credit').reduce((s: number, a: any) => s + Number(a.balance), 0);
    const totalDebt = accounts.filter((a: any) => a.type === 'credit').reduce((s: number, a: any) => s + Math.abs(Number(a.balance)), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await accountsApi.create({ ...form, balance: Number(form.balance) });
            setShowForm(false);
            setForm({ name: '', type: 'checking', institution: '', balance: 0, color: '#06d6a0', icon: 'fa-university' });
            fetchAccounts();
            toast('Cuenta creada exitosamente');
        } catch (err) { toast('Error al crear la cuenta', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Eliminar cuenta',
            message: `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            await accountsApi.remove(id);
            fetchAccounts();
            toast('Cuenta eliminada');
        } catch { toast('Error al eliminar', 'error'); }
    };

    return (
        <div className="accounts-page">
            <div className="page-header">
                <div>
                    <h1>Cuentas</h1>
                    <p className="text-muted">Gestiona todas tus cuentas financieras</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`} /> {showForm ? 'Cancelar' : 'Nueva Cuenta'}
                </button>
            </div>

            <div className="summary-row">
                <div className="card summary-card">
                    <div className="icon-box icon-green"><i className="fas fa-arrow-up" /></div>
                    <div><div className="summary-value">{formatCOP(totalAssets)}</div><div className="text-muted" style={{ fontSize: 13 }}>Total Activos</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-red"><i className="fas fa-arrow-down" /></div>
                    <div><div className="summary-value">{formatCOP(totalDebt)}</div><div className="text-muted" style={{ fontSize: 13 }}>Deuda Total</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-blue"><i className="fas fa-balance-scale" /></div>
                    <div><div className="summary-value">{formatCOP(totalAssets - totalDebt)}</div><div className="text-muted" style={{ fontSize: 13 }}>Patrimonio Neto</div></div>
                </div>
            </div>

            {showForm && (
                <div className="card form-card fade-up">
                    <h3><i className="fas fa-plus-circle text-accent" /> Nueva Cuenta</h3>
                    <form onSubmit={handleSubmit} className="acc-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Cuenta Ahorros Bancolombia" required />
                            </div>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Institución</label>
                                <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Ej: Bancolombia" required />
                            </div>
                            <div className="form-group">
                                <label>Saldo Actual (COP)</label>
                                <input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })} />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                </div>
            )}

            {Object.entries(typeGroups).map(([group, types]) => {
                const groupAccounts = accounts.filter((a: any) => types.includes(a.type));
                if (groupAccounts.length === 0) return null;
                const groupTotal = groupAccounts.reduce((s: number, a: any) => s + Number(a.balance), 0);
                const groupIcon = group === 'Jubilación' ? 'fa-shield-alt' : group === 'Inversiones' ? 'fa-chart-line' : 'fa-credit-card';

                return (
                    <div key={group} className="account-group fade-up">
                        <div className="group-header">
                            <h2><i className={`fas ${groupIcon} text-accent`} /> {group}</h2>
                            <span className="group-total">{formatCOP(groupTotal)}</span>
                        </div>
                        <div className="account-cards">
                            {groupAccounts.map((a: any) => (
                                <div className="card account-card" key={a.id}>
                                    <div className="acc-card-header">
                                        <div className={`icon-box ${Number(a.balance) < 0 ? 'icon-red' : 'icon-green'}`} style={{ background: `${a.color}20`, color: a.color }}>
                                            <i className={`fas ${a.icon}`} />
                                        </div>
                                        <button className="acc-delete" onClick={() => handleDelete(a.id, a.name)} title="Eliminar">
                                            <i className="fas fa-trash-alt" />
                                        </button>
                                    </div>
                                    <div className="acc-card-name">{a.name}</div>
                                    <div className="acc-card-inst text-muted">{a.institution} · {typeLabels[a.type] || a.type}</div>
                                    <div className={`acc-card-balance ${Number(a.balance) < 0 ? 'text-danger' : ''}`}>
                                        {formatCOP(Number(a.balance))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

    import { useEffect, useState } from 'react';
import { subscriptionsApi } from '../api';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import './Subscriptions.css';

const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        name: '', amount: 0, period: 'monthly',
        nextBillingDate: today,
        color: '#f59e0b', icon: 'fa-sync'
    });

    const confirm = useConfirm();
    const toast = useToast();

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const { data } = await subscriptionsApi.list();
            setSubscriptions(data.subscriptions);
        } catch (err) { console.error('Error fetching subscriptions', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSubscriptions(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await subscriptionsApi.create({ ...form, amount: Number(form.amount) });
            setShowForm(false);
            setForm({ name: '', amount: 0, period: 'monthly', nextBillingDate: today, color: '#f59e0b', icon: 'fa-sync' });
            fetchSubscriptions();
            toast('Suscripción creada exitosamente');
        } catch (err) { toast('Error al crear suscripción', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Eliminar suscripción',
            message: `¿Deseas eliminar "${name}" de tus pagos recurrentes?`,
            confirmText: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            await subscriptionsApi.remove(id);
            fetchSubscriptions();
            toast('Suscripción eliminada');
        } catch { toast('Error al eliminar', 'error'); }
    };

    const toggleStatus = async (sub: any) => {
        try {
            await subscriptionsApi.update(sub.id, { isActive: !sub.isActive });
            fetchSubscriptions();
            toast(`Suscripción ${!sub.isActive ? 'activada' : 'pausada'}`);
        } catch { toast('Error al cambiar estado', 'error'); }
    };

    // Calculations
    const activeSubs = subscriptions.filter(s => s.isActive);
    const totalMonthly = activeSubs.reduce((sum, s) => {
        return sum + (s.period === 'yearly' ? Number(s.amount) / 12 : Number(s.amount));
    }, 0);
    const totalYearly = totalMonthly * 12;

    // Upcoming in next 14 days
    const upcomingBills = activeSubs.filter(s => {
        const days = getDaysUntil(s.nextBillingDate);
        return days >= 0 && days <= 14;
    }).sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

    return (
        <div className="subscriptions-page">
            <div className="page-header">
                <div>
                    <h1>Suscripciones y Cobros</h1>
                    <p className="text-muted">Gestiona tus pagos recurrentes y evita sorpresas</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`} /> {showForm ? 'Cancelar' : 'Nuevo Cobro'}
                </button>
            </div>

            <div className="summary-row">
                <div className="card summary-card">
                    <div className="icon-box icon-red"><i className="fas fa-calendar-alt" /></div>
                    <div><div className="summary-value text-danger">{formatCOP(totalMonthly)}</div><div className="text-muted" style={{ fontSize: 13 }}>Gasto Mensual</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-purple"><i className="fas fa-calendar-check" /></div>
                    <div><div className="summary-value">{formatCOP(totalYearly)}</div><div className="text-muted" style={{ fontSize: 13 }}>Gasto Anual Proyectado</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-blue"><i className="fas fa-sync" /></div>
                    <div><div className="summary-value">{activeSubs.length}</div><div className="text-muted" style={{ fontSize: 13 }}>Suscripciones Activas</div></div>
                </div>
            </div>

            {showForm && (
                <div className="card form-card fade-up">
                    <h3><i className="fas fa-plus-circle text-accent" /> Nuevo Pagos Recurrente</h3>
                    <form onSubmit={handleSubmit} className="sub-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre del servicio</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Netflix, Tarjeta Visa..." required />
                            </div>
                            <div className="form-group">
                                <label>Monto a pagar (COP)</label>
                                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Ciclo de cobro</label>
                                <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
                                    <option value="monthly">Mensual</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Próximo Cobro</label>
                                <input type="date" value={form.nextBillingDate} onChange={(e) => setForm({ ...form, nextBillingDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Icono (Clase FontAwesome)</label>
                                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="fa-film" />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ height: 42, width: '100%', cursor: 'pointer' }} />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Suscripción'}
                        </button>
                    </form>
                </div>
            )}

            {/* Rader de próximos Pagos (Upcoming Bills) */}
            {upcomingBills.length > 0 && (
                <div className="card radar-card fade-up">
                    <div className="radar-header">
                        <h3><i className="fas fa-radar text-warning pulse-icon" /> Próximos 14 Días</h3>
                        <span className="text-muted text-sm">Cobros inminentes</span>
                    </div>
                    <div className="radar-timeline">
                        {upcomingBills.map(sub => {
                            const days = getDaysUntil(sub.nextBillingDate);
                            const urgencyClass = days <= 3 ? 'urgent' : days <= 7 ? 'warning' : 'safe';
                            return (
                                <div key={`radar-${sub.id}`} className={`radar-item ${urgencyClass}`}>
                                    <div className="radar-date">
                                        <span className="radar-day">{new Date(sub.nextBillingDate).getDate()}</span>
                                        <span className="radar-month">{new Date(sub.nextBillingDate).toLocaleDateString('es-CO', { month: 'short' })}</span>
                                    </div>
                                    <div className="radar-dot" style={{ borderColor: sub.color }} />
                                    <div className="radar-content">
                                        <div className="radar-info">
                                            <span className="radar-name">{sub.name}</span>
                                            <span className="radar-amount text-danger">{formatCOP(Number(sub.amount))}</span>
                                        </div>
                                        <span className="radar-timeleft">
                                            {days === 0 ? '¡Hoy!' : days === 1 ? 'Mañana' : `En ${days} días`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="subscriptions-grid">
                {loading ? (
                    <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>Cargando suscripciones...</p>
                ) : subscriptions.length === 0 ? (
                    <div className="card empty-state fade-up" style={{ gridColumn: '1 / -1' }}>
                        <i className="fas fa-calendar-check" />
                        <p>No tienes cobros recurrentes registrados.</p>
                    </div>
                ) : (
                    subscriptions.map(sub => (
                        <div key={sub.id} className={`card sub-card fade-up ${!sub.isActive ? 'sub-paused' : ''}`}>
                            <div className="sub-header">
                                <div className="icon-box" style={{ background: `${sub.color}20`, color: sub.color }}>
                                    <i className={`fas ${sub.icon}`} />
                                </div>
                                <div className="sub-actions">
                                    <button className="sub-btn" onClick={() => toggleStatus(sub)} title={sub.isActive ? 'Pausar' : 'Activar'}>
                                        <i className={`fas ${sub.isActive ? 'fa-pause' : 'fa-play'}`} />
                                    </button>
                                    <button className="sub-btn sub-delete" onClick={() => handleDelete(sub.id, sub.name)} title="Eliminar">
                                        <i className="fas fa-trash-alt" />
                                    </button>
                                </div>
                            </div>
                            <h4 className="sub-name">{sub.name}</h4>
                            <div className="sub-amount">
                                <span className="text-danger">{formatCOP(Number(sub.amount))}</span>
                                <span className="text-muted text-sm"> / {sub.period === 'monthly' ? 'mes' : 'año'}</span>
                            </div>
                            <div className="sub-footer">
                                <div className="sub-next-date">
                                    <i className="far fa-calendar-alt text-muted" /> Próximo: {formatDate(sub.nextBillingDate)}
                                </div>
                                {!sub.isActive && <span className="badge badge-red">Pausada</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

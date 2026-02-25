import { useEffect, useState } from 'react';
import { goalsApi } from '../api';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import './Goals.css';

const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Goals() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', targetAmount: 0, currentAmount: 0, deadline: '', color: '#06d6a0' });
    const [saving, setSaving] = useState(false);
    const confirm = useConfirm();
    const toast = useToast();

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const { data } = await goalsApi.list();
            setGoals(data.goals);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGoals(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await goalsApi.create({ ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount) });
            setShowForm(false);
            setForm({ name: '', targetAmount: 0, currentAmount: 0, deadline: '', color: '#06d6a0' });
            fetchGoals();
            toast('Meta creada exitosamente');
        } catch (err) { toast('Error al crear la meta', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Eliminar meta',
            message: `¿Eliminar la meta "${name}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            await goalsApi.remove(id);
            fetchGoals();
            toast('Meta eliminada');
        } catch { toast('Error al eliminar', 'error'); }
    };

    const handleAddFunds = async (goal: any) => {
        const input = prompt(`Añadir fondos a "${goal.name}" (COP):`, '100000');
        if (!input) return;
        const amount = Number(input);
        if (isNaN(amount) || amount <= 0) return;
        try {
            await goalsApi.update(goal.id, { currentAmount: Number(goal.currentAmount) + amount });
            fetchGoals();
            toast(`${formatCOP(amount)} añadido a "${goal.name}"`);
        } catch { toast('Error al actualizar', 'error'); }
    };

    const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
    const totalCurrent = goals.reduce((s, g) => s + Number(g.currentAmount), 0);
    const overallPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

    return (
        <div className="goals-page">
            <div className="page-header">
                <div>
                    <h1>Metas de Ahorro</h1>
                    <p className="text-muted">{goals.length} metas activas</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`} /> {showForm ? 'Cancelar' : 'Nueva Meta'}
                </button>
            </div>

            <div className="goals-summary-row">
                <div className="card summary-card">
                    <div className="icon-box icon-purple"><i className="fas fa-bullseye" /></div>
                    <div><div className="summary-value">{formatCOP(totalTarget)}</div><div className="text-muted" style={{ fontSize: 13 }}>Total Objetivo</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-green"><i className="fas fa-coins" /></div>
                    <div><div className="summary-value text-accent">{formatCOP(totalCurrent)}</div><div className="text-muted" style={{ fontSize: 13 }}>Ahorrado</div></div>
                </div>
                <div className="card summary-card">
                    <div className="icon-box icon-blue"><i className="fas fa-percentage" /></div>
                    <div><div className="summary-value">{overallPct}%</div><div className="text-muted" style={{ fontSize: 13 }}>Progreso General</div></div>
                </div>
            </div>

            {showForm && (
                <div className="card form-card fade-up">
                    <h3><i className="fas fa-plus-circle text-accent" /> Nueva Meta</h3>
                    <form onSubmit={handleSubmit} className="goal-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Vacaciones Cancún" required />
                            </div>
                            <div className="form-group">
                                <label>Monto Objetivo (COP)</label>
                                <input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: Number(e.target.value) })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Ahorrado hasta ahora (COP)</label>
                                <input type="number" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: Number(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label>Fecha límite (opcional)</label>
                                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Color</label>
                                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="color-input" />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : 'Crear Meta'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Cargando metas...</p>
            ) : goals.length === 0 ? (
                <div className="card empty-state fade-up">
                    <i className="fas fa-bullseye" />
                    <p>No tienes metas aún. ¡Crea una para empezar a ahorrar!</p>
                </div>
            ) : (
                <div className="goals-grid">
                    {goals.map((g) => {
                        const pct = Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100);
                        const remaining = Number(g.targetAmount) - Number(g.currentAmount);

                        return (
                            <div className="card goal-card fade-up" key={g.id}>
                                <div className="goal-card-header">
                                    <div className="goal-icon-circle" style={{ background: `${g.color}20`, borderColor: g.color }}>
                                        <span style={{ color: g.color, fontSize: 18, fontWeight: 800 }}>{pct}%</span>
                                    </div>
                                    <div className="goal-actions">
                                        <button className="goal-add-btn" onClick={() => handleAddFunds(g)} title="Añadir fondos">
                                            <i className="fas fa-plus" />
                                        </button>
                                        <button className="goal-delete-btn" onClick={() => handleDelete(g.id, g.name)} title="Eliminar">
                                            <i className="fas fa-trash-alt" />
                                        </button>
                                    </div>
                                </div>
                                <h4>{g.name}</h4>
                                <div className="goal-amounts">
                                    <span className="text-accent">{formatCOP(Number(g.currentAmount))}</span>
                                    <span className="text-muted"> / {formatCOP(Number(g.targetAmount))}</span>
                                </div>
                                <div className="goal-bar-container">
                                    <div className="goal-bar">
                                        <div className="goal-fill" style={{ width: `${Math.min(100, pct)}%`, background: g.color }} />
                                    </div>
                                </div>
                                <div className="goal-remaining text-muted">
                                    {remaining > 0 ? `Faltan ${formatCOP(remaining)}` : '🎉 ¡Meta alcanzada!'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

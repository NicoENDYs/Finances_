import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('nicolas@aurora.app');
    const [password, setPassword] = useState('aurora123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">✦ Aurora</div>
                <p className="login-subtitle">Tu centro financiero personal</p>
                <form onSubmit={handleSubmit}>
                    {error && <div className="login-error">{error}</div>}
                    <div className="login-field">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="login-field">
                        <label>Contraseña</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </button>
                </form>
                <p className="login-hint text-muted">Demo: nicolas@aurora.app / aurora123</p>
            </div>
        </div>
    );
}

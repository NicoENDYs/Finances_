import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: 'fas fa-th-large', label: 'Dashboard' },
    { to: '/accounts', icon: 'fas fa-wallet', label: 'Cuentas' },
    { to: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transacciones' },
    { to: '/subscriptions', icon: 'fas fa-sync', label: 'Suscripciones' },
    { to: '/goals', icon: 'fas fa-bullseye', label: 'Metas' },
    { to: '/investments', icon: 'fas fa-chart-line', label: 'Inversiones' },
];

export default function Sidebar() {
    const { user, logout } = useAuthStore();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">✦ Aurora</div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        end={item.to === '/'}
                    >
                        <i className={item.icon} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-user">
                <div className="sidebar-avatar">{user?.name?.charAt(0) || 'U'}</div>
                <div className="sidebar-user-info">
                    <strong>{user?.name}</strong>
                    <span onClick={logout} style={{ cursor: 'pointer' }}>Cerrar sesión</span>
                </div>
            </div>
        </aside>
    );
}

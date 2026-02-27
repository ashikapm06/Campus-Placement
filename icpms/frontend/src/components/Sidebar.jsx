import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,
    User,
    LogOut,
    LayoutDashboard,
    Award,
    BarChart
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const studentLinks = [
        { to: '/student', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/student/jobs', icon: <Briefcase size={20} />, label: 'Jobs' },
        { to: '/student/profile', icon: <User size={20} />, label: 'My Profile' },
    ];

    const officerLinks = [
        { to: '/officer', icon: <BarChart size={20} />, label: 'Overview' },
        { to: '/officer/drives/new', icon: <Briefcase size={20} />, label: 'Create Drive' },
        { to: '/officer/audits', icon: <Award size={20} />, label: 'Audit Logs' },
    ];

    const links = user?.role === 'officer' ? officerLinks : studentLinks;

    return (
        <aside className="sidebar fade-in">
            <div className="sidebar-header">
                <div className="logo-icon">ICP</div>
                <h2 className="logo-text">Intelligent Campus</h2>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        end={link.to === '/student' || link.to === '/officer'}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div className="user-details">
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="user-role">{user?.role === 'officer' ? 'Placement Officer' : 'Student'}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

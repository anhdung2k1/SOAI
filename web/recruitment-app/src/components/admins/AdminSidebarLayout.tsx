import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { logout } from '../../shared/apis/authApis';
import { PRIVATE_ADMIN_ROUTE, PUBLIC_ROUTE } from '../../shared/constants/routes';
import classNames from 'classnames/bind';
import styles from '../../assets/styles/admins/adminSideBarLayout.module.scss';
import SmartRecruitmentLogo from '../../assets/images/smart-recruitment-admin-logo.png';

const cx = classNames.bind(styles);

const menu = [
    { label: 'Home', path: PRIVATE_ADMIN_ROUTE.dashboard },
    { label: 'All CVs', path: PRIVATE_ADMIN_ROUTE.candidateCV },
    { label: 'All Interviews', path: PRIVATE_ADMIN_ROUTE.candidateInterview },
    { label: 'All Job Descriptions', path: PRIVATE_ADMIN_ROUTE.job },
    { label: 'All Accounts', path: PRIVATE_ADMIN_ROUTE.user },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(PUBLIC_ROUTE.signin);
    };

    return (
        <div className={cx('admin-layout')}>
            <nav className={cx('sidebar')}>
                <h2 className={cx('sidebar__header')}>Smart Recruitment</h2>

                <section className={cx('sidebar__nav')}>
                    {menu.map((item) => (
                        <NavLink
                            key={item.label}
                            to={`${item.path}`}
                            end={item.label === 'Home'}
                            className={({ isActive }) => {
                                return cx('sidebar__nav-link', { 'sidebar__nav-link--active': isActive });
                            }}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </section>

                <div className={cx('sidebar__footer')}>
                    <img src={SmartRecruitmentLogo} alt="Admin Avatar" className={cx('sidebar__footer-avatar')} />
                    <div className={cx('sidebar__footer-account')}>
                        <p className={cx('sidebar__footer-account-name')}>Admin</p>
                        <p className={cx('sidebar__footer-account-email')}>smart.recruit.ai@gmail.com</p>
                    </div>
                    <button className={cx('sidebar__logout-btn')} onClick={handleLogout} title="Logout">
                        <FiLogOut size={18} />
                    </button>
                </div>
            </nav>

            <div className={cx('admin-layout__content')}>{children}</div>
        </div>
    );
};

export default AdminLayout;

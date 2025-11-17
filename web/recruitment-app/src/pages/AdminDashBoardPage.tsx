import { useSelector } from 'react-redux';
import type { RootState } from '../services/redux/store';
import classNames from 'classnames/bind';
import styles from '../assets/styles/admins/adminDashBoardPage.module.scss';
import { Col, Row } from '../components/layouts';
import AdminStatCard from '../components/admins/AdminStatCard';
import AdminCVList from '../components/admins/AdminCVList';
import AdminLayout from '../components/admins/AdminLayout';
import cvIcon from '../assets/icons/file-text.png';
import userIcon from '../assets/icons/user.png';
import jdIcon from '../assets/icons/briefcase.png';
import AdminUserList from '../components/admins/AdminUserList';
import AdminJDList from '../components/admins/AdminJDList';

const cx = classNames.bind(styles);

const AdminDashBoardPage = () => {
    const statistic = useSelector((state: RootState) => state.adminStatistic);

    return (
        <AdminLayout>
            <div className={cx('admin-dashboard')}>
                <h1 className={cx('admin-dashboard__title')}>Welcome, Admin</h1>
                <p className={cx('admin-dashboard__item', 'admin-dashboard__subtitle')}>Monitor all candidate applications and interview tasks here.</p>

                <Row space={10} className={cx('admin-dashboard__item', 'admin-dashboard__stats')}>
                    <Col size={{ lg: 4, xl: 4 }} className={cx('admin-dashboard__stats-card')}>
                        <AdminStatCard label="Total CVs" count={statistic.cvCount} icon={cvIcon} />
                    </Col>
                    <Col size={{ lg: 4, xl: 4 }} className={cx('admin-dashboard__stats-card')}>
                        <AdminStatCard label="Total Users" count={statistic.accountCount} icon={userIcon} />
                    </Col>
                    <Col size={{ lg: 4, xl: 4 }} className={cx('admin-dashboard__stats-card')}>
                        <AdminStatCard label="Job Descriptions" count={statistic.jobCount} icon={jdIcon} />
                    </Col>
                </Row>

                <div className={cx('admin-dashboard__item')}>
                    <AdminCVList />
                </div>

                <div className={cx('admin-dashboard__item')}>
                    <AdminUserList />
                </div>

                <div className={cx('admin-dashboard__item')}>
                    <AdminJDList />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashBoardPage;

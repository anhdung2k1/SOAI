import { useSelector } from 'react-redux';
import type { RootState } from '../services/redux/store';
import { Col, Row } from '../components/layouts';
import classNames from 'classnames/bind';
import styles from '../assets/styles/admins/adminDashBoardPage.module.scss';
import userIcon from '../assets/icons/user.png';
import cvIcon from '../assets/icons/file-text.png';
import jdIcon from '../assets/icons/briefcase.png';
import AdminLayout from '../components/admins/AdminLayout';
import AdminCVList from '../components/admins/AdminCVList';
import AdminJDList from '../components/admins/AdminJDList';
import AdminAccountList from '../components/admins/AdminAccountList';
import AdminStatisticsCard from '../components/admins/AdminStatisticsCard';

const cx = classNames.bind(styles);

const AdminDashBoardPage = () => {
    const statistic = useSelector((state: RootState) => state.adminStatistics);

    return (
        <AdminLayout>
            <div className={cx('admin-dashboard')}>
                <h1 className={cx('admin-dashboard__item', 'admin-dashboard__item--title')}>Welcome, Admin</h1>
                <p className={cx('admin-dashboard__item', 'admin-dashboard__item--subtitle')}>Monitor all candidate applications and interview tasks here.</p>

                <Row space={10} className={cx('admin-dashboard__item')}>
                    <Col size={{ lg: 4, xl: 4 }}>
                        <AdminStatisticsCard label="Total CVs" count={statistic.cvCount} icon={cvIcon} />
                    </Col>
                    <Col size={{ lg: 4, xl: 4 }}>
                        <AdminStatisticsCard label="Total Users" count={statistic.accountCount} icon={userIcon} />
                    </Col>
                    <Col size={{ lg: 4, xl: 4 }}>
                        <AdminStatisticsCard label="Job Descriptions" count={statistic.jobCount} icon={jdIcon} />
                    </Col>
                </Row>

                <div className={cx('admin-dashboard__item')}>
                    <AdminCVList />
                </div>

                <div className={cx('admin-dashboard__item')}>
                    <AdminAccountList />
                </div>

                <div className={cx('admin-dashboard__item')}>
                    <AdminJDList />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashBoardPage;

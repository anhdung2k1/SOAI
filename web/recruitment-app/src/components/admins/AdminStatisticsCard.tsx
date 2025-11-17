import classNames from 'classnames/bind';
import styles from '../../assets/styles/admins/adminStatisticsCard.module.scss';

const cx = classNames.bind(styles);

interface AdminStatisticsCardProps {
    label: string;
    count: number;
    icon: string;
}

const AdminStatisticsCard = ({ label, count, icon }: AdminStatisticsCardProps) => {
    return (
        <div className={cx('admin-statistic-card')}>
            <div className={cx('admin-statistic-card__header')}>
                <div className={cx('admin-statistic-card__icon')}>
                    <img src={icon} alt={label} />
                </div>
            </div>
            <div className={cx('admin-statistic-card__count')}>{count}</div>
            <div className={cx('admin-statistic-card__label')}>{label}</div>
        </div>
    );
};

export default AdminStatisticsCard;

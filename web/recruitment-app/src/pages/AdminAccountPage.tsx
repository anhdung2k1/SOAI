import AdminSidebarLayout from '../components/admins/AdminSidebarLayout';
import AdminUserList from '../components/admins/AdminAccountList';

const AdminAccountPage = () => {
    return (
        <AdminSidebarLayout>
            <AdminUserList />
        </AdminSidebarLayout>
    );
};

export default AdminAccountPage;

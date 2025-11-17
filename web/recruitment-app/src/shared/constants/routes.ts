export const PRIVATE_ADMIN_ROUTE = {
    dashboard: '/admin/dashboard',
    cv: '/admin/candidate/cvs',
    account: '/admin/accounts',
    job: '/admin/dashboard/job/descriptions',
    interview: '/admin/candidate/interviews',
} as const;

export const PUBLIC_ROUTE = {
    signin: '/signin',
    signup: '/signup',
} as const;

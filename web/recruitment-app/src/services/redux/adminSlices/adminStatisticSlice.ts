import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AdminStatistic {
    cvCount: number;
    jobCount: number;
    accountCount: number;
}

const initialState: AdminStatistic = {
    cvCount: 0,
    jobCount: 0,
    accountCount: 0,
};

export const adminStatSlice = createSlice({
    name: 'admin-dashboard-statistic',
    initialState,
    reducers: {
        setNumberOfCV: (state, action: PayloadAction<number>): AdminStatistic => {
            return {
                ...state,
                cvCount: action.payload,
            };
        },

        setNumberOfJob: (state, action: PayloadAction<number>): AdminStatistic => {
            return {
                ...state,
                jobCount: action.payload,
            };
        },

        setNumberOfAccount: (state, action: PayloadAction<number>): AdminStatistic => {
            return {
                ...state,
                accountCount: action.payload,
            };
        },
    },
});

export const { setNumberOfCV, setNumberOfJob, setNumberOfAccount } = adminStatSlice.actions;

export default adminStatSlice.reducer;

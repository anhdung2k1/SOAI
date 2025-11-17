import { configureStore } from '@reduxjs/toolkit';
import adminStatisticReducer from './adminSlices/adminStatisticSlice';

export const store = configureStore({
    reducer: {
        adminStatistic: adminStatisticReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

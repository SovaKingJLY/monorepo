import { initGlobalState } from 'qiankun';

export const globalStateActions = initGlobalState({
    isDark: false,
    quoteMessage: '',
});

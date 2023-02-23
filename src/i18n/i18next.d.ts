import 'i18next';
import resources from 'i18n/translations';

declare module 'i18next' {
    interface CustomTypeOptions {
        returnNull: false;
        resources: typeof resources.en;
    }
}

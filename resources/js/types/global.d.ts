import type { Auth } from '@/types/auth';
import type { ServerNavItem, SharedNotification } from '@/types/navigation';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            navigation: ServerNavItem[];
            notificationSummary: {
                unreadCount: number;
                recent: SharedNotification[];
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}

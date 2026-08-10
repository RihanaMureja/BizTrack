export type SubscriptionPlan = {
    id: number;
    name: string;
    price: string | number;
    duration_months: number;
    duration_days: number | null;
    max_cashiers: number;
    description: string | null;
    features: string[] | null;
};

export type SubscriptionRecommendation = {
    status: string;
    daysRemaining: number | null;
    warningDays: number;
    isExpiring: boolean;
    limitReached: boolean;
    reason: 'expiring' | 'limit' | null;
    cashiersCount: number;
    maxCashiers: number | null;
    currentPlan: SubscriptionPlan | null;
    recommendedPlan: SubscriptionPlan | null;
    isRenewal: boolean;
};

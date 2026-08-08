const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatDisplayDate(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    const dateOnly = DATE_ONLY_PATTERN.test(value) ? value : value.slice(0, 10);

    if (!DATE_ONLY_PATTERN.test(dateOnly)) {
        return '-';
    }

    const [year, month, day] = dateOnly.split('-');

    return `${day}/${month}/${year}`;
}

export function todayDateInput(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

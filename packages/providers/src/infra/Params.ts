export const queryParam = (key: string, value: string | null) => value ? `${key}=${value}` : "";

export const pathValue = (key: string, value: string | number | undefined | null) => value ? `${key}/${value}` : "";

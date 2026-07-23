export function formatAddress(addr) {
    if (!addr) return '';
    const parts = [addr.detail, addr.ward?.name, addr.province?.name].filter(Boolean);
    return parts.join(', ');
}

export const emptyAddress = { province: null, ward: null, detail: '' };
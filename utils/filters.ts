export const shortTON = (rawTON: bigint) : string => {
    const out = (Number(BigInt(rawTON) * 100n) / 100000000000)
    return Math.abs(out) < 0.1 ? out.toFixed(3).toString() : Math.abs(out) > 100 ? out.toString() : out.toPrecision(3).toString()
}

export const fullTON = (rawTON: bigint) : string => {
    return (Number(BigInt(rawTON) * 100n) / 100000000000).toString()
}

export const isNumeric = (value: any) : boolean => {
    return /^-?\d+$/.test(value)
}

export const truncString = (value: string, keepLeft: number = 3, keepRight: number = keepLeft) : string => {
    if (value.length < (keepLeft + keepRight)) return value;
    return value.slice(0, keepLeft) + '...' + value.slice(value.length - keepRight, value.length);
}

export const chainTitle = (id: number) => {
    if (id===0) return 'BaseChain'
    if (id===-1) return 'MasterChain'
    return id
}

export const toBase64Web = (base64: string) => base64.replace(/\+/g, '-').replace(/\//g, '_');

export const toBase64Rfc = (base64: string) => base64.replace(/\-/g, '+').replace(/_/g, '/');

const feeFormatter = new Intl.NumberFormat('fullwide', {
    maximumFractionDigits: 9,
    minimumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
});

export const formatTons = function formatNanoTonsLimitNumberLength(value: number, decimals = 9, round = false) {
    const valueMultiplier = Number.isInteger(decimals)
        ? Math.pow(10, decimals)
        : 10**9;

    return round
        ? currencyFormatter.format(value / valueMultiplier)
        : feeFormatter.format(value / valueMultiplier);
};

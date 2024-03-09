export const shortTON = (rawTON: bigint) : string => {
    const out = (Number(BigInt(rawTON) * 100n) / 100000000000)
    return Math.abs(out) < 0.1 ? out.toFixed(3).toString() : Math.abs(out) > 100 ? out.toString() : out.toPrecision(3).toString()
}

export const tinyTON = (rawTON: bigint) : string => {
    const out = (Number(BigInt(rawTON) * 100n) / 100000000000)
    return out.toFixed(5).toString()
}

export const roundTON = (rawTON: bigint) : string => {
    const out = (Number(BigInt(rawTON) * 100n) / 100000000000)
    return Math.round(out).toString()
}

export const fullTON = (rawTON: bigint, delta: boolean = true) : string => {
    return (BigInt(rawTON) > 0n && delta ? '+' : '') + (Number(BigInt(rawTON) * 100n) / 100000000000).toString()
}

export const msToISO = (time: number | Date) : string => new Date(time).toISOString().split('.')[0] +"Z"

export const toCompact = (input: number | bigint) : string => {
    let formatter = Intl.NumberFormat('en', { notation: 'compact' });
    return formatter.format(input)
}

export const mobileFieldProcess = (value: string | number | bigint, left: number = 20, right:  number = 0): string => {
    return isMobile() ? truncString(value.toString(), left, right) : value.toString()
}

export const truncString = (value: string, keepLeft: number = 3, keepRight: number = keepLeft) : string => {
    if (value.length < (keepLeft + keepRight)) return value;
    return value.slice(0, keepLeft) + '...' + value.slice(value.length - keepRight, value.length)
}

export const chainTitle = (id: number) => {
    if (id===0) return 'BaseChain'
    if (id===-1) return 'MasterChain'
    return id
}

export const toBase64Web = (base64: string) => base64.replace(/\+/g, '-').replace(/\//g, '_')

export const toBase64Rfc = (base64: string) => base64.replace(/\-/g, '+').replace(/_/g, '/')

const feeFormatter = new Intl.NumberFormat('fullwide', {
    maximumFractionDigits: 9,
    minimumFractionDigits: 0,
})

const currencyFormatter = new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
})

export const formatTons = function formatNanoTonsLimitNumberLength(value: number, decimals = 9, round = false) {
    const valueMultiplier = Number.isInteger(decimals)
        ? Math.pow(10, decimals)
        : 10**9;

    return round
        ? currencyFormatter.format(value / valueMultiplier)
        : feeFormatter.format(value / valueMultiplier);
}

export const opToHex = (op: number) => `0x${op.toString(16)}`

export const CEXAddress = (input: string) => input[0] === 'f' ? ('-1:' + input.substring(2)) : input.substring(0, 1) + ':' + input.substring(2)

export const convertBase64ToHex = (value: string) => {
    if (process.server) {
        return Buffer.from(value, 'base64').toString('hex');
    } else {
        const raw = atob(value);
        let result = '';
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16);
            result += (hex.length === 2 ? hex : '0' + hex);
        }
        return result
    }
}

export const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
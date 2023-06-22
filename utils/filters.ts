export const shortTON = (rawTON: bigint) : string => {
    const out = (Number(BigInt(rawTON) * 100n) / 100000000000)
    return Math.abs(out) < 0.1 ? out.toFixed(3).toString() : Math.abs(out) > 100 ? out.toString() : out.toPrecision(3).toString()
}

export const fullTON = (rawTON: bigint, delta: boolean = true) : string => {
    return (BigInt(rawTON) > 0n && delta ? '+' : '') + (Number(BigInt(rawTON) * 100n) / 100000000000).toString()
}

export const isMobile = () => useDevice().isMobile

export const opToHex = (op: number) => `0x${op.toString(16)}`

export const colorAmount = (ton : bigint) => BigInt(ton) > 0n ? 'green' : BigInt(ton) === 0n ? '' : 'red'

export const isNumeric = (value: any) : boolean => {
    return /^-?\d+$/.test(value)
}

export const mobileFieldProcess = (value: string | number | bigint, left: number = 20, right:  number = 0): string => {
    return isMobile() ? truncString(value.toString(), left, right) : value.toString()
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

type badList = {
    [key: string] : {
        name: string
        hex: string
        base64: string
    }
}
export const badAddresses = {
    "0:0000000000000000000000000000000000000000000000000000000000000000" : {
        name: "Burner account",
        hex: "0:0000000000000000000000000000000000000000000000000000000000000000",
        base64: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
    },
    "-1:0000000000000000000000000000000000000000000000000000000000000000" : {
        name: "System account",
        hex: "-1:0000000000000000000000000000000000000000000000000000000000000000",
        base64: "Ef8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAU"
    },
    "-1:3333333333333333333333333333333333333333333333333333333333333333" : {
        name: "Elector account",
        hex: "-1:3333333333333333333333333333333333333333333333333333333333333333",
        base64: "Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF"
    },
    "-1:34517c7bdf5187c55af4f8b61fdc321588c7ab768dee24b006df29106458d7cf" : {
        name: "Logs test account",
        hex: "-1:34517c7bdf5187c55af4f8b61fdc321588c7ab768dee24b006df29106458d7cf",
        base64: "Ef80UXx731GHxVr0-LYf3DIViMerdo3uJLAG3ykQZFjXz2kW"
    },
    "-1:5555555555555555555555555555555555555555555555555555555555555555" : {
        name: "Config account",
        hex: "-1:5555555555555555555555555555555555555555555555555555555555555555",
        base64: "Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn"
    },
    "0:07235bc6bb0edde161be0ad7c3ad6a843cdb6652e2a32851057899996aaa9f59" : {
        name: "BSC Bridge Collector",
        hex: "0:07235bc6bb0edde161be0ad7c3ad6a843cdb6652e2a32851057899996aaa9f59",
        base64: "EQAHI1vGuw7d4WG-CtfDrWqEPNtmUuKjKFEFeJmZaqqfWTvW"
    },
    "0:aecef20e5cb8c7dadbf7e60638b73848bd70aa6560ee2bd91484519728b22683" : {
        name: "ETH Bridge account",
        hex: "0:aecef20e5cb8c7dadbf7e60638b73848bd70aa6560ee2bd91484519728b22683",
        base64: "EQCuzvIOXLjH2tv35gY4tzhIvXCqZWDuK9kUhFGXKLImgxT5"
    }
} as badList

export const knownOp = {
    0: "System op in ",
    1: "Received TONs in ",
    2: "Sending TONs in ",
    99: 'Multisend'
} as OPMap
export const shortTON = (rawTON: bigint) : string => {
    return (Number(rawTON * 100n / 1000000000n) / 100).toPrecision(3).toString()
}

export const fullTON = (rawTON: bigint) : string => {
    return (Number(rawTON * 100n / 1000000000n) / 100).toString()
}

export const isNumeric = (value: any) : boolean => {
    return /^-?\d+$/.test(value)
}
export const shortTON = (rawTON: number, cutOff: number = 3) : string => {
    return (rawTON / 1000000000).toPrecision(cutOff)
}

export const fullTON = (rawTON: number) : string => {
    return (rawTON / 1000000000).toString()
}

export const isNumeric = (value: any) : boolean => {
    return /^-?\d+$/.test(value)
}

export const truncString = (value: string, keepLeft: number = 3, keepRight: number = keepLeft) : string => {
    if (value.length < 7) return value;
    return value.slice(0, keepLeft) + '...' + value.slice(value.length - keepRight, value.length);
}

export const chainTitle = (id: number) => {
    if (id===0) return 'BaseChain'
    if (id===-1) return 'MasterChain'
    return id
}
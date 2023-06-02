export const shortTON = (rawTON: number) : string => {
    return (rawTON / 1000000000).toPrecision(3)
}

export const fullTON = (rawTON: number) : string => {
    return (rawTON / 1000000000).toString()
}

export const isNumeric = (value: any) : boolean => {
    return /^-?\d+$/.test(value)
}
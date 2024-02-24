export const isMobile = () => useDevice().isMobile

export const isNumeric = (value: any) : boolean => {
    return /^-?\d+$/.test(value)
}

export const isHex = (value: any) : boolean => {
    return /^-?[\da-fA-F]+$/.test(value)
}

export const isValidName = (value: any) : boolean => {
    return /^[_\da-zA-z]+$/.test(value)
}
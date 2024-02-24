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

export const blockKeyGen = (workchain: number, shard: bigint, seq_no: number) : BlockKey => `${workchain}:${shard}:${seq_no}`

export const blockKeyDegen = (key: string) : { workchain: number, shard: bigint, seq_no: number } | null => {
    const out = {
        workchain: 0,
        shard: 0n,
        seq_no: 0
    }
    const params: string[] = key.split(':')
    if (params.length === 0 || (params[0] !== '0' && params[0] !== '-1')) return null
    if (params.length === 2 && isNumeric(params[1])) {
        out.workchain = Number(params[0])
        out.seq_no = Number(params[1])
        out.shard = -9223372036854775808n
    } 
    else if (params.length === 3 && isNumeric(params[1]) && isNumeric(params[2])) {
        out.workchain = Number(params[0])
        out.shard = BigInt(params[1])
        out.seq_no = Number(params[2])
    } 
    else return null
    return out
}
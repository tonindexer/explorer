const ADDRESS_REGEX = new RegExp(/[UEk0][Qf][\w\-]{46}/);
const TX_REGEX_OLD = new RegExp(/^\d+[\$:](?<hash>[\w\+\-\/]{43}\=)[\$:][\w\+\-\/]+$/, 'i');
// address links
const TONWEB_ADDRESS_REGEX = new RegExp(`^ton://transfer/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONSCAN_ADDRESS_REGEX = new RegExp(`^https://tonscan.org/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONWHALES_ADDRESS_REGEX = new RegExp(`^https://tonwhales.com(?:\/[a-z]{2})?/explorer/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONAPI_ADDRESS_REGEX = new RegExp(`^https://tonapi.io/account/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONSH_ADDRESS_REGEX = new RegExp(`^https://ton.sh/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONVIEWER_ADDRESS_REGEX = new RegExp(`^https://tonviewer.com/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONNFT_ADDRESS_REGEX = new RegExp(`^https://explorer.tonnft.tools/address/(?<address>${ADDRESS_REGEX.source})`, 'i');
const TONOBS_ADDRESS_REGEX = new RegExp(`^https://tonobserver.com/explorer/info?address=(?<address>${ADDRESS_REGEX.source})`, 'i');
const DTON_ADDRESS_REGEX = new RegExp(`^https://dton.io/a/(?<address>${ADDRESS_REGEX.source})`, 'i');

export const trnParse = (input: string): TxSearch | null => {
    if ((input.length === 44 && input.endsWith('=')) || input.match(/^[\da-f]{64}$/))
        return {type: 'transaction',
            value: {
                hash: input
            }
        }
    return null
}

export const blockParse = (input: string): BlockSearch | null => {
    const checker = input.split(':')
    if (checker.length !== 3 && checker.length !== 2) return null
    if (checker[0] !== '-1' && checker[0] !== '0') return null
    if (!(isNumeric(checker[1]))) return null
    if (checker[2] && !(isNumeric(checker[2]))) return null
    return {
        type: 'block',
        value: {
            workchain: Number(checker[0]),
            shard: checker[2] ? BigInt(checker[1]) : -9223372036854775808n,
            seq_no: checker[2] ? Number(checker[2]) : Number(checker[1])
        }
    }
}

export const removeClutter = (input: string) => {
    if (input)
        for (let regex of [
            // addresses
            TONWEB_ADDRESS_REGEX, TONSCAN_ADDRESS_REGEX,TONWHALES_ADDRESS_REGEX,
            TONAPI_ADDRESS_REGEX,TONSH_ADDRESS_REGEX, TONVIEWER_ADDRESS_REGEX,
            TONNFT_ADDRESS_REGEX,TONOBS_ADDRESS_REGEX, DTON_ADDRESS_REGEX,
            // transactions
            TX_REGEX_OLD

        ]) {
            if (regex.test(input)) {
                const trim = regex.exec(input);
                if (trim?.length && trim[1]) return trim[1] 
            }
        }
    return input;
};

export const addParse = (input: string) : AccSearch | null => {
    input = removeClutter(input)

    if (input.length !== 48 && input.length !== 66) return null
    if ((input.length === 66 && input[1] === ':' && input.split(':')[1].match(/^[\da-f]{64}$/)) || input.match(ADDRESS_REGEX)) return {
        type: 'account',
        value: {
            hex: input
        }
    }
    return null

}

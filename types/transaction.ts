export {}

declare global {
    type Transaction = {

        address: Address
        hash: string
        // account: Account | null -- API data only -- remapped
        account_key: AccountKey | null

        workchain: number
        shard: bigint
        block_seq_no: number

        prev_tx_hash?: string
        prev_tx_lt?: bigint

        in_msg_hash: string
        // in_msg: Message | null -- API data only -- remapped
        in_amount?: bigint | null

        // out_msg?: Message[] | null -- API data only -- remapped
        out_msg_keys: MessageKey[]
        out_msg_count: number
        out_amount?: bigint | null

        total_fees: bigint | null

        description_boc?: string
        description_loaded?: any
        compute_phase_exit_code: number
        action_phase_result_code: number

        orig_status: AccountStatus
        end_status: AccountStatus

        created_at: string
        created_lt: bigint
    }

    interface TransactionAPI extends Omit<Transaction, 'account_key' | 'in_msg_key' | 'out_msg_keys'> {
        account?: Account | null // '?' for mapping the interface
        in_msg?: MessageAPI | null // '?' for mapping the interface
        out_msg?: MessageAPI[] | null
    }

    type TransactionAPIData = {
        total: number
        results: TransactionAPI[]
    }
    
    type TransactionKey = string

    type TransactionMap = {
        [key: TransactionKey] : Transaction
    }
}
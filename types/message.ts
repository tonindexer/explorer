export {};

declare global {
    
    type MessageType = "INTERNAL" | "EXTERNAL_IN" | "EXTERNAL_OUT"
    type MessageDirection = 'IN' | 'OUT' | 'EXT_IN' | 'EXT_OUT'
    type Message = {

        type: MessageType

        hash: string

        src_tx_key: string | null
        dst_tx_key: string | null

        src_address?: Address
        src_tx_lt?: bigint
        src_tx_hash?: string
        src_workchain: string
        src_shard: bigint
        src_block_seq_no: number
        // src_state: Account | null -- API data only -- remapped
        src_state_key: AccountKey | null

        dst_address?: Address
        dst_tx_lt?: bigint
        dst_tx_hash?: string
        dst_workchain: string
        dst_shard: bigint
        dst_block_seq_no: number
        // dst_state: Account | null -- API data only -- remapped
        dst_state_key: AccountKey | null

        bounce: boolean
        bounced: boolean

        amount?: bigint | null

        ihr_disabled: boolean
        ihr_fee: bigint | null
        fwd_fee: bigint | null

        body: string
        body_hash: string

        operation_id?: number
        transfer_comment?: string

        state_init_code?: string
        state_init_data?: string

        src_contract?: ContractType
        dst_contract?: ContractType

        operation_name?: string
        data?: string
        error?: string

        created_at: string
        created_lt: bigint
    }

    interface MessageAPI extends Omit<Message, 'src_state_key' | 'dst_state_key' | 'src_tx_key' | 'dst_tx_key' | 'direction'> {
        src_state?: Account | null // '?' for mapping the interface
        dst_state?: Account | null // '?' for mapping the interface
    }

    type MessageAPIData = {
        total: number
        results: MessageAPI[]
    }
    
    type MessageKey = string

    type MessageMap = {
        [key: MessageKey]: Message
    }
}
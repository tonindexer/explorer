export {};

declare global {

    type BlockID = {
        workchain: number
        shard: bigint
        seq_no: number
    }

    type Block = {
        workchain: number
        shard: bigint
        seq_no: number

        file_hash: string
        root_hash: string

        // master?: BlockID | null -- API data only -- remapped
        // shards?: Block[] | null -- API data only -- remapped
        master_key?: BlockKey
        shard_keys: BlockKey[]

        // transactions?: Transaction[] | null -- API data only -- remapped
        transactions_count: number
        transaction_keys: TransactionKey[]

        scanned_at: string

        loaded: boolean
    }

    type BlockAPI = Omit<Block, 'master_key' | 'shard_keys' | 'transaction_keys' | 'loaded'> & {
        master?: BlockID | null
        shards?: BlockAPI[] | null
        transactions?: TransactionAPI[] | null
    }

    type BlockAPIData = {
        total: number
        results: BlockAPI[]
    }

    type BlockKey = `${number}:${bigint | string}:${number}`

    type BlockMap = {
        [key: BlockKey] : Block
    }
}
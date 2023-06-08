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
        transaction_keys: TransactionKey[]

        // scanned_at: string -- not present in current API

        transaction_delta: bigint
    }

    interface BlockAPI extends Omit<Block, 'master_key' | 'shard_keys' | 'transaction_keys' | 'transaction_delta'> {
        master?: BlockID | null
        shards?: BlockAPI[] | null
        transactions?: TransactionAPI[] | null
    }

    type BlockKey = `${number}:${bigint}:${number}`

    type BlockMap = {
        [key: BlockKey] : Block
    }
}
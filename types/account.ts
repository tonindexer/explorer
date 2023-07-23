export { };

declare global {
    
    type AccountStatus = "ACTIVE" | "UNINIT" | "FROZEN" | "NONEXIST"
    type LabelCategory = "centralized_exchange" | "scam"
    type ReturnFormat = boolean | bigint | string | number | {"URI" : string}

    type VmValue = {
        name: string
        stack_type: string
        [key: string] : ReturnFormat
    }
    type GetMethod = {
            name: string,
            error?: string
            arguments?: VmValue[]
            receives?: ReturnFormat[]
            return_values: VmValue[]
            returns: ReturnFormat[]
        }
    type Address = {
        hex : string,
        base64 : string
    }
    type AddressLabel = {
        name: string,
        categories?: LabelCategory[]
    }
    type NFTContentData = {
        content_uri?: string
        content_name?: string
        content_description?: string
        content_image?: string
        content_image_date?: string[]
    }
    type FTWalletData = {
        jetton_balance?: bigint
    }

    interface Account extends NFTContentData, FTWalletData {

        address: Address
        label?: AddressLabel

        workchain: number
        shard: bigint
        block_seq_no: number

        is_active: boolean
        status: AccountStatus

        balance: bigint
        
        last_tx_lt: bigint
        last_tx_hash: string

        state_hash?: string
        code?: string
        code_hash?: string
        data?: string
        data_hash?: string

        get_method_hashes?: number[]

        fake?: boolean

        types?: string[]

        owner_address?: Address
        minter_address?: Address

        executed_get_methods?: { [key: string] : GetMethod[] }

        // nft_items: NFTContentData[]
        // nft_keys: NFTKey[]
        jetton_wallets: AccountKey[]
        minted_nfts: AccountKey[]
        owned_nfts: AccountKey[]
        transaction_keys: TransactionKey[]

        jetton_amount: number
        nft_amount: number
        minted_amount: number
        transaction_amount: number

        updated_at: string
    }

    interface AccountAPI extends Omit<Account, 'jetton_wallets' | 
        'minted_nfts' | 'transaction_keys' | 'jetton_amount' | 'nft_amount' | 'minted_amount' | 'transaction_amount'> {}

    type AccountAPIData = {
        total: number
        results: AccountAPI[]
    }
    type AccountKey = string

    type AccountMap = {
        [key: AccountKey] : Account
    }
    // v1 metadata
    type MetadataAPI = {
        name: string
        attributes?: {
            trait_type: string
            value: string
        }[]
        description: string
        decimals: number
        symbol?: string
        server_error?:string
        image_url?: string
        address: Address
        last_tx_lt: number
        updated_at: string
    }

    type MetadataAPIData = {
        results: MetadataAPI[] | null
    }

    type MetadataMap = {
        [key: AccountKey] : {
            description: string
            decimals: number
            name: string
            image_url: string
            symbol: string
        }
    }

    type MetadataRelations = {
        [key: AccountKey] : {
            owner: Address
            minter: Address
        }
    }

    // Top holders
    type NFTOwnerCell = {
        owner_address: Address
        items_count: number
    }

    type NFTUniqueCell = {
        item_address: Address
        owners_count: number
    }

    type NFTHolder = {
        items: number
        owners_count: number
        owned_items?: NFTOwnerCell[]
        unique_owners?: NFTUniqueCell[]
    }

    type NFTHolderMap = {
        [key: AccountKey] : NFTHolder
    }

    type JettonOwnerCell = {
        wallet_address: Address
        owner_address: Address
        balance: bigint
    }

    type JettonHolder = {
        wallets: number
        total_supply: number
        owned_balance: JettonOwnerCell[]
    }

    type JettonHolderMap = {
        [key: AccountKey] : JettonHolder
    }

    interface HoldersAPI extends NFTHolder, JettonHolder {}

}
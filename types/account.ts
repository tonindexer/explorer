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

    type JettonWallet = {
        jetton_balance: string
        wallet_address: string
        minter_address: string
        name: string
        symbol: string
    }

    type JettonWalletKey = `${string}|${string}`
    type NFTKey = `${string}|${string}`

    type JettonWalletMap = {
        [key: JettonWalletKey] : JettonWallet
    }
    type NFTMap = {
        [key: NFTKey] : NFTAPI
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

        jetton_wallets: JettonWalletKey[]
        nft_items: NFTContentData[]
        nft_keys: NFTKey[]
        minted_nfts: NFTKey[]
        transaction_keys: TransactionKey[]

        jetton_amount: number
        nft_amount: number
        minted_amount: number
        transaction_amount: number

        updated_at: string
    }

    interface AccountAPI extends Omit<Account, 'jetton_wallets' | 'nft_keys' | 'nft_items' | 
        'minted_nfts' | 'transaction_keys' | 'jetton_amount' | 'nft_amount' | 'minted_amount' | 'transaction_amount'> {}

    type AccountAPIData = {
        total: number
        results: AccountAPI[]
    }
    type AccountKey = string

    type AccountMap = {
        [key: AccountKey] : Account
    }

    // tonapi
    type AddressAPI = {
        address: string
        name?: string
        is_scam: boolean
        icon?: string
    }
    type JettonAPI = {
        address: string
        name: string
        symbol: string
        decimals: number
        image: string
        verification:  'whitelist' | 'blacklist' | 'none'
    }
    type JettonAPIFull = {
        balance: string
        wallet_address: AddressAPI
        jetton: JettonAPI
    }
    type JettonAPIData = {
        balances: JettonAPIFull[]
    }

    type NFTMeta = {
        image?: string
        description?: string
        marketplace?: string
        external_url?: string
        name?: string
    }
    type NFTCollection = {
        address: string
        name: string
    }
    type NFTPreview = {
        resolution: `${number}:${number}`
        url: string
    }
    type NFTAPI = {
        address: string
        index: bigint
        owner: AccountAPI
        collection: NFTCollection
        verified: boolean
        metadata: NFTMeta
        previews: NFTPreview[]
        approved_by: ('getgems' | 'tonkeeper')[]
    }
    type NFTAPIData = {
        nft_items: NFTAPI[]
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
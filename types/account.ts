export { };

declare global {
    
    type AccountStatus = "ACTIVE" | "UNINIT" | "FROZEN" | "NONEXIST"
    type LabelCategory = "centralized_exchange" | "scam"
    type ReturnFormat = Address | boolean | bigint | string | number

    type VmValue = {
        name: string
        [key: string] : ReturnFormat
    }
    type GetMethod = {
        [key: string] : {
            name: string,
            arguments?: VmValue[] | ReturnFormat
            return_values: VmValue[] | ReturnFormat
        }
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
    type Account = {

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

        types?: string[]

        owner_address?: Address
        minter_address?: Address

        executes_get_methods?: GetMethod[]

        nft_content_data?: NFTContentData
        ft_wallet_data?: FTWalletData

        updated_at: string
    }

    type AccountKey = string

    type AccountMap = {
        [key: AccountKey] : Account
    }
}
export { };

declare global {
    type TableData = [
        number, bigint | number
    ]
    
    type SearchType = 'account' | 'transaction' | 'block' | 'label'
    type IntervalAPI = '15m' | '1h' | '4h' | '8h' | '24h'
    type PresetInterval = 'day' | 'week' | 'month' | 'all' | 'other'
    
    type GraphCell = {
        Value: number
        Timestamp: string
    }

    type GraphAPI = {
        count_results?: GraphCell[]
        sum_results?: GraphCell[]
    }

    type LabelSearch = {
        type: 'label'
        value: string,
        show?: string
    }
    type BlockSearch = {
        type: 'block'
        value: {
            workchain: number
            shard: bigint
            seq_no: number
        }
        show?: string
    }

    type TxSearch = {
        type: 'transaction'
        value: {
            hash: string
        }
        show?: string
    }

    type AccSearch = {
        type: 'account'
        value: {
            hex: string
        }
        show?: string
    }

    type Search = Array<BlockSearch | TxSearch | AccSearch | LabelSearch>

    type SearchAPI = {
        address: Address
        categories: LabelCategory[]
        name: string
    }

    type SearchAPIData = {
        total: number
        results: SearchAPI[]
    }
    type Statistics = {
        account_count : number,
        address_count : number,
        contract_interface_count : number,
        contract_operation_count : number,
        first_masterchain_block : number,
        last_masterchain_block : number,
        masterchain_block_count : number,
        message_count : number,
        parsed_account_count : number,
        parsed_address_count : number,
        parsed_message_count : number,
        transaction_count : number,
        address_count_by_status : Array<{ status: string, count: number }>,
        address_count_by_interfaces : Array<{ interfaces: string[], count: number }>,
        message_count_by_operation : Array<{ operation: string, count: number }>
    }

    type MockType = {
        [key: string] : any
    }

    type NullableStrNumRef = Ref<string | number | null>
    type NullableNumRef = Ref<number | null>
    type NullableStrRef = Ref<string | null>
    type NullableBigRef = Ref<bigint | null>

    type SpecialAccList = {
        [key: string] : {
            name: string
            hex: string
            base64: string
        }
    }

    type RouteLink = {
        parent?: string
        route: string
        t: string
        selected: boolean
    }
}
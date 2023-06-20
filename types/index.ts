export { };

declare global {
    type SearchType = 'account' | 'transaction' | 'block'

    type BlockSearch = {
        type: 'block'
        value: {
            workchain: number
            shard: bigint
            seq_no: number
        }
    }

    type TxSearch = {
        type: 'transaction'
        value: {
            hash: string
        }
    }

    type AccSearch = {
        type: 'account'
        value: {
            hex: string
        }
    }

    type Search = Array<BlockSearch | TxSearch | AccSearch>

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
        account_count_by_status? : Array<Object>,
        account_count_by_interfaces? : Array<Object>,
        message_count_by_operation? : Array<Object>,
        [key: string] : any,
    }

    type MockType = {
        [key: string] : any
    }

    type NullableStrNumRef = Ref<string | number | null>
    type NullableNumRef = Ref<number | null>
    type NullableStrRef = Ref<string | null>
    type NullableBigRef = Ref<bigint | null>
}
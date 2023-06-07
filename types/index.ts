export { };

declare global {
    type AccountStatus = "ACTIVE" | "UNINIT" | "FROZEN"
    // type PayloadData = {
    //     [key : string] : string | number | null
    // }
    // type Master = {
    //     workchain: number,
    //     shard: number,
    //     seq_no: number,
    // }
    // type Address = {
    //     hex : string,
    //     base64 : string
    // }
    // type Types = Array<string>

    // type StateData = {
    //     address: Address,
    //     last_tx_lt: number,
    //     last_tx_hash: string,
    //     balance: number,
    //     types?: Types,
    //     owner_address?: Address,
    //     royalty_address?: Address,
    //     minter_address?: Address,
    //     wallet_seq_no?: number,
    //     royalty_factor?: number,
    //     royalty_base?: number,
    //     content_uri?: string,
    //     initialized?: boolean,
    //     item_index?: number,
    //     updated_at: string
    // }
    // interface Account extends StateData {
    //     is_active: boolean,
    //     status: AccountStatus,
    //     state_data?: StateData,
    //     code: string,
    //     code_hash: string,
    //     data: string,
    //     data_hash: string,
    //     get_method_hashes: Array<number> | null
    // }
    // type BaseMessage = {
    //     type: string,
    //     hash: string,
    //     src_address: Address,
    //     src_contract?: string,
    //     dst_address: Address,
    //     dst_contract?: string,
    //     amount?: number,
    //     source_tx_hash?: string,
    //     source_tx_lt?: number,
    //     body?: string,
    //     body_hash: string,
    //     operation_id?: number,
    //     created_at: string,
    //     created_lt: number
    // }
    // type ExtraFields = {
    //     bounce: boolean,
    //     bounced: boolean,
    //     ihr_disabled: boolean,
    //     ihr_fee: number | null,
    //     fwd_fee: number | null,
    //     transfer_comment?: string,
    //     state_init_code?: string,
    //     state_init_data?: string,
    // }
    // interface Payload extends BaseMessage {
    //     amount: number,
    //     operation_name: string,
    //     data: PayloadData,
    //     minter_address: Address
    // }
    // interface Message extends BaseMessage, ExtraFields {
    //     payload?: Payload
    // }
    // type Transaction = {
    //     address: Address,
    //     hash: string,
    //     account: Account | null,
    //     block_workchain: number,
    //     block_shard: number,
    //     block_seq_no: number,
    //     prev_tx_hash: string,
    //     prev_tx_lt?: number,
    //     in_msg_hash: string | null,
    //     in_msg?: Message | null,
    //     in_amount: number,
    //     out_msg?: Array<Message>,
    //     out_msg_count: number,
    //     out_amount: number,
    //     total_fees: number,
    //     description_boc: string,
    //     result_code: number,
    //     compute_phase_exit_code?: number,
    //     action_phase_result_code?: number,
    //     orig_status: AccountStatus,
    //     end_status: AccountStatus,
    //     created_at: string,
    //     created_lt: number,
    //     workchain?: number,
    //     shard?: number,  
    //     seq_no?: number,
    // }
    // type Shard = {
    //     workchain: number,
    //     shard: number,
    //     seq_no: number,
    //     file_hash: string,
    //     root_hash: string,
    //     master: Master,
    //     transactions: Array<Transaction> | null,
    //     scanned_at?: string,
    // }
    // type Block = {
    //     workchain: number,
    //     shard: number,
    //     seq_no: number,
    //     file_hash: string,
    //     root_hash: string,
    //     shards?: Array<Shard>,
    //     transactions: Array<Transaction> | null
    //     scanned_at?: string,
    // }
    type SmallShard = {
        workchain: number,
        shard: bigint,
        seq_no: number,
        tr_count: number,
        tr_final: number
    }
    interface SmallBlock extends SmallShard {
        shards : Array<SmallShard>
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
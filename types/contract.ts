export {};

declare global {
    
    type ContractType = string

    type SchemaBody = {
        name: string
        tlb_type: string
        format: string
        struct_fields?: string[]
    }
    type Schema = {
        op_name: string
        op_code: string
        body: SchemaBody[]
    }
    type ContractInterface = {
        name: string
        addresses?: Address[] | null
        code?: string
        get_methods_descriptors?: GetMethod[]
        get_method_hashes?: number[]
    }
    type ContractInterfaceMap = {
        [key: string] : ContractInterface
    }
    type ContractInterfaceAPI = {
        total: number
        results: ContractInterface[]
    }
    type ContractOperation = {
        operation_name: string
        contract_name: ContractType
        message_type: MessageType
        outgoing: boolean
        operation_id: number
        schema: Schema
    }
}
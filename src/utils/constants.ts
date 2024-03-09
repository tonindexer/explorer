
export const specialAccounts: SpecialAccList = {
    "0:0000000000000000000000000000000000000000000000000000000000000000" : {
        name: "Burner account",
        hex: "0:0000000000000000000000000000000000000000000000000000000000000000",
        base64: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
    },
    "-1:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffef" : {
        name: "Burner account",
        hex: "0:0000000000000000000000000000000000000000000000000000000000000000",
        base64: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
    },
    "-1:0000000000000000000000000000000000000000000000000000000000000000" : {
        name: "System account",
        hex: "-1:0000000000000000000000000000000000000000000000000000000000000000",
        base64: "Ef8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAU"
    },
    "-1:3333333333333333333333333333333333333333333333333333333333333333" : {
        name: "Elector account",
        hex: "-1:3333333333333333333333333333333333333333333333333333333333333333",
        base64: "Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF"
    },
    "-1:34517c7bdf5187c55af4f8b61fdc321588c7ab768dee24b006df29106458d7cf" : {
        name: "Logs test account",
        hex: "-1:34517c7bdf5187c55af4f8b61fdc321588c7ab768dee24b006df29106458d7cf",
        base64: "Ef80UXx731GHxVr0-LYf3DIViMerdo3uJLAG3ykQZFjXz2kW"
    },
    "-1:5555555555555555555555555555555555555555555555555555555555555555" : {
        name: "Config account",
        hex: "-1:5555555555555555555555555555555555555555555555555555555555555555",
        base64: "Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn"
    },
    "0:07235bc6bb0edde161be0ad7c3ad6a843cdb6652e2a32851057899996aaa9f59" : {
        name: "BSC Bridge Collector",
        hex: "0:07235bc6bb0edde161be0ad7c3ad6a843cdb6652e2a32851057899996aaa9f59",
        base64: "EQAHI1vGuw7d4WG-CtfDrWqEPNtmUuKjKFEFeJmZaqqfWTvW"
    },
    "0:aecef20e5cb8c7dadbf7e60638b73848bd70aa6560ee2bd91484519728b22683" : {
        name: "ETH Bridge account",
        hex: "0:aecef20e5cb8c7dadbf7e60638b73848bd70aa6560ee2bd91484519728b22683",
        base64: "EQCuzvIOXLjH2tv35gY4tzhIvXCqZWDuK9kUhFGXKLImgxT5"
    }
}

export const knownOp: OPMap = {
    0: "System op",
    1: "Received TONs",
    2: "Sending TONs",
    99: 'Multisend'
}

export const bigintFields: MockType = {
    shard: true, 
    balance: true, 
    jetton_balance: true, 
    last_tx_lt: true,
    src_shard: true,
    dst_shard: true,
    src_tx_lt: true,
    dst_tx_lt: true,
    in_amount: true,
    out_amount: true,
    total_fees: true,
    amount: true,
    ihr_fee: true,
    fwd_fee: true,
    created_lt: true
}
import { parseJson } from '@ton.js/json-parser';
import { getQueryArrayString } from '~/utils/api';

export const useMainStore = defineStore('tonexp', {
    state: () => ({
      // Total counters per type - returned with the request for latest info
      totalBlocks: 0 as number,
      totalTransactions: 0 as number,
      // Maps to store blocks / messages / transactions / accounts efficiently
      blocks: {} as BlockMap,
      messages: {} as MessageMap,
      transactions: {} as TransactionMap,
      accounts: {} as AccountMap,
      // wallets and nfts
      jettonWallets: {} as JettonWalletMap,
      // Arrays with keys to fetch the correct info from maps
      latestBlocks: [] as BlockKey[],
      latestTransactions: [] as TransactionKey[],
      exploredBlocks: [] as BlockKey[],
      exploredTransactions: [] as TransactionKey[],
      exploredAccounts: [] as AccountKey[],
      // Statistics.
      stats : {} as Statistics
    }),
    getters: {
      getLatestBlocks: (state) => state.latestBlocks.map((key) => state.blocks[key]),
      getLatestTransactions: (state) => state.latestTransactions.map((key) => state.transactions[key]),
      getBlockShards: (state) => (key: BlockKey) => state.blocks[key].shard_keys.map((shardKey) => state.blocks[shardKey]),
      getBlockKeys: (state) => (keys: BlockKey[], excludeEmpty: boolean) => excludeEmpty ? keys.filter((item: BlockKey) => state.blocks[item].transaction_keys.length > 0) : keys,
      deepTransactionKeys: (state) => (key: BlockKey) => {
        const output: string[] = [...state.blocks[key].transaction_keys]
        state.blocks[key].shard_keys.forEach((shrd: BlockKey) => output.push(...state.blocks[shrd].transaction_keys))
        return output
      },
      getMessageKeys: (state) => (keys: TransactionKey[], in_: boolean, out_: boolean)  : MessageKey[] => {
        const output: MessageKey[] = []
        for (const key of keys) {
          if (key in state.transactions) {
            if (state.transactions[key].in_msg_hash && in_) output.push(state.transactions[key].in_msg_hash)
            if (out_) output.push(...state.transactions[key].out_msg_keys)
          }
        }
        return output
      },
      getAccountKeys: (state) => (keys: MessageKey[], loaded_: boolean = true) => {
        const output: AccountKey[] = []
        for (const key of keys) {
          if (key in state.messages) {
            const dst = state.messages[key].dst_address?.hex
            const src = state.messages[key].src_address?.hex
            if (dst && ((loaded_ && dst in state.accounts) || (!loaded_ && !(dst in state.accounts)))) output.push(dst)
            if (src && ((loaded_ && src in state.accounts) || (!loaded_ && !(src in state.accounts)))) output.push(src)
          }
        }
        return [...new Set(output)]
      }
    },
    actions: {
      blockKeyGen: (workchain: number, shard: bigint, seq_no: number) : BlockKey => `${workchain}:${shard}:${seq_no}`,
      processAccount(account: AccountAPI) {
        const accountKey = account.address.hex
        const mappedAccount = <Account>{}
        mappedAccount.nft_items = []
        mappedAccount.jetton_wallets = []

        // Don't override account if the stored state matched given
        if (accountKey in this.accounts) {
          if (this.accounts[accountKey].block_seq_no === account.block_seq_no) return accountKey
        }
        if (account.jetton_balance && account.minter_address?.hex) {
          const jt_key : JettonWalletKey= `${account.address.hex}|${account.minter_address?.hex}`
          if (!(jt_key in this.jettonWallets)) this.jettonWallets[jt_key] = {
            jetton_balance: account.jetton_balance,
            minter_address: account.minter_address.hex,
            name: ""
          } 
          mappedAccount.jetton_wallets.push(jt_key)
        }

        Object.assign(mappedAccount, account)

        this.accounts[accountKey] = mappedAccount
        return accountKey
      },
      processMessage(message: MessageAPI) {
        const messageKey = message.hash

        // Don't override messages
        if (messageKey in this.messages) return messageKey

        const mappedMessage = <Message>{}

        if (message.src_state) {
          mappedMessage.src_state_key = this.processAccount(message.src_state)
          delete message.src_state
        }
        if (message.dst_state) {
          mappedMessage.dst_state_key = this.processAccount(message.dst_state)
          delete message.dst_state
        }

        Object.assign(mappedMessage, message)

        this.messages[messageKey] = mappedMessage
        return messageKey
      },
      processTransaction(transaction: TransactionAPI) {
        const transactionKey = transaction.hash

        // Don't override transactions
        if (transactionKey in this.transactions) return transactionKey

        const mappedTransaction = <Transaction>{}
        mappedTransaction.out_msg_keys = []
        mappedTransaction.delta = 0n + BigInt(transaction.in_amount ?? 0n) - BigInt(transaction.out_amount ?? 0n)

        if (transaction.account) {
          mappedTransaction.account_key = this.processAccount(transaction.account)
          delete transaction.account
        }
        if (transaction.in_msg) {
          this.processMessage(transaction.in_msg)
          delete transaction.in_msg
        }
        if (transaction.out_msg !== undefined) {
          if (transaction.out_msg?.length)
            mappedTransaction.out_msg_keys.push(...transaction.out_msg.map(msg => this.processMessage(msg)))
          delete transaction.out_msg
        }

        Object.assign(mappedTransaction, transaction)

        this.transactions[transactionKey] = mappedTransaction
        return transactionKey
      },
      processBlock(block: BlockAPI) {
        const blockKey : BlockKey = this.blockKeyGen(block.workchain, block.shard, block.seq_no)

        // Don't override existing blocks
        if (blockKey in this.blocks) return blockKey

        const mappedBlock = <Block>{}
        mappedBlock.shard_keys = []
        mappedBlock.transaction_keys = []
        mappedBlock.transaction_delta = 0n
        
        if (block.master !== undefined) {
          if (block.master) {
            mappedBlock.master_key = `${block.master.workchain}:${block.master.shard}:${block.master.seq_no}`
          }
          delete block.master
        }
        if (block.shards !== undefined) {
          if (block.shards) {
            mappedBlock.shard_keys.push(...block.shards.map(shard => this.processBlock(shard)))
          }
          delete block.shards
        }
        if (block.transactions !== undefined) {
          if (block.transactions) {
            mappedBlock.transaction_keys.push(...block.transactions.map(tr => this.processTransaction(tr)))
            mappedBlock.transaction_keys.forEach((tr: TransactionKey) => mappedBlock.transaction_delta += this.transactions[tr].delta)
          }
          delete block.transactions
        }

        Object.assign(mappedBlock, block)

        this.blocks[blockKey] = mappedBlock
        return blockKey
      },
      async mainPageLoad() {
        try {
          this.latestBlocks = []
          const latestReq = {
            workchain: -1,
            with_transactions: true,
            order: 'DESC',
            limit: 10
          }
          const query = getQueryString(latestReq, false)
        
          const { data } = await apiRequest(`/blocks?${query}`, 'GET')
          const parsed = parseJson<BlockAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          for (const key in parsed.results) {
            const block = this.processBlock(parsed.results[key])
            this.latestBlocks.push(block)
          }
        } catch (error) {
          console.log(error)
        }
        try {
          this.latestTransactions = []
          const latestReq = {
            order: 'DESC',
            limit: 10
          }
          const query = getQueryString(latestReq, false);
          const { data } = await apiRequest(`/transactions?${query}`, 'GET')
          const parsed = parseJson<TransactionAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          for (const key in parsed.results) {
            const trn = this.processTransaction(parsed.results[key])
            this.latestTransactions.push(trn)
          }
        } catch (error) {
          console.log(error)
        }
        try {
          const { data } = await apiRequest(`/statistics`, 'GET')
          this.stats = JSON.parse(data);
          Object.keys(this.stats).forEach(key => {
            if (this.stats[key] instanceof Array) delete this.stats[key];
          });
        } catch (error) {
          console.log(error)
        }
      },
      async initLoad() {
        const route = useRoute()
        switch (route.path) {
          case '/': {
            await this.mainPageLoad()
            break
          } 
          case '/blocks': {
            if (Object.entries(route.query).length === 0) {
              await this.updateBlockValues(10, null)
            } else {
              const wc = route.query.workchain && isNumeric(route.query.workchain) ? Number(route.query.workchain) : null
              const sh = route.query.shard  && isNumeric(route.query.shard) ? BigInt(route.query.shard.toString()) : null
              const sq = route.query.seq_no && isNumeric(route.query.seq_no) ? Number(route.query.seq_no) : null
              if (wc && sh && sq) await this.fetchBlock(wc, sh, sq)
            }
            break;
          }
          case '/transactions': {
            if (Object.entries(route.query).length === 0) {
              await this.updateTransactions(20, null)
            } else {
              const hash = route.query.hash && toBase64Rfc(route.query.hash.toString())
              if (hash) await this.fetchTransaction(hash)
            }
            break;
          }
          case '/accounts': {
            if (Object.entries(route.query).length === 0) {
              await this.updateAccounts(20, null)
            }  else {
              const hex = route.query.hex && toBase64Rfc(route.query.hex.toString())
              if (hex) await this.fetchAccount(hex)
            }
            break;
          }
        }
        
        
      },
      async updateBlockValues(limit: number = 10, seqOffset: number | null, order: "ASC" | "DESC" = "DESC") {
        this.exploredBlocks = []
        const fullReq: MockType = {
          workchain: -1,
          with_transactions: true,
          order,
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        const query = getQueryString(fullReq, false)
        try {
          const { data } = await apiRequest(`/blocks?${query}`, 'GET')
          const parsed = parseJson<BlockAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));

          for (const key in parsed.results) {
            const block = this.processBlock(parsed.results[key])
            this.exploredBlocks.push(block)
            this.exploredBlocks.push(...this.blocks[block].shard_keys)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async updateTransactions(limit: number, seqOffset: bigint | null, excludeWC: boolean = false, order: "ASC" | "DESC" = "DESC") { 
        this.exploredTransactions = []
        const fullReq: MockType = {
          order, 
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        if (excludeWC) fullReq.workchain = 0
        const query = getQueryString(fullReq, false)
        try {
          const { data } = await apiRequest(`/transactions?${query}`, 'GET')
          const parsed = parseJson<TransactionAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          for (const key in parsed.results) {
            const trn = this.processTransaction(parsed.results[key])
            this.exploredTransactions.push(trn)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async updateAccounts(limit: number, seqOffset: bigint | null, order: "ASC" | "DESC" = "DESC") { 
        this.exploredAccounts = []
        const fullReq: MockType = {
          order, 
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        const query = getQueryString(fullReq, false)
        try {
          const { data } = await apiRequest(`/accounts?${query}`, 'GET')
          const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          for (const key in parsed.results) {
            const acc = this.processAccount(parsed.results[key])
            this.exploredAccounts.push(acc)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async fetchBlock(workchain: number, shard: bigint, seq_no: number) {
        const fullReq: MockType = {
          workchain: workchain? -1 : 0,
          shard,
          with_transactions: true,
          seq_no
        }
        const query = getQueryString(fullReq, false);
        try {
          const { data } = await apiRequest(`/blocks?${query}`, 'GET')
          const parsed = parseJson<BlockAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.processBlock(parsed.results[0])
        } catch (error) {
          console.log(error)
        }
      },
      async fetchTransaction(hash: string) {
        const fullReq: MockType = {
          hash
        }
        const query = getQueryString(fullReq, true);
        try {
          const { data } = await apiRequest(`/transactions?${query}`, 'GET')
          const parsed = parseJson<TransactionAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.processTransaction(parsed.results[0])
        } catch (error) {
          console.log(error)
        }
      },
      async fetchAccount(hex: string) {
        let jt_count = 0
        let nft_count = 0
        try {
        const fullReq: MockType = {
          address: hex,
          latest: true
        }
        const query = getQueryString(fullReq, true);
        // get latest account state
          const { data } = await apiRequest(`/accounts?${query}`, 'GET')
          const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.processAccount(parsed.results[0])
        } catch (error) {
          console.log(error)
        }
        // get all jetton_wallet of account
        try {
          const jettonReq: MockType = {
            owner_address: hex,
            latest: true,
            interface: 'jetton_wallet',
            limit: 50
          }
          // TODO paginate requests
          const query = getQueryString(jettonReq, true);
          const { data } = await apiRequest(`/accounts?${query}`, 'GET')
          const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
            (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          jt_count = parsed.total
          if (jt_count)
            for (const acc of parsed.results) {
              if (acc.jetton_balance && acc.minter_address?.hex) {
                const jt_key : JettonWalletKey= `${hex}|${acc.minter_address?.hex}`
                if (!(jt_key in this.jettonWallets)) this.jettonWallets[jt_key] = {
                  jetton_balance: acc.jetton_balance,
                  minter_address: acc.minter_address.hex,
                  name: ""
                } 
                this.accounts[hex].jetton_wallets.push(jt_key)
              }
            }
            // get all jetton_wallet minters of account
            try {
              const jettonReq: MockType = {
                address: this.accounts[hex].jetton_wallets.map(jt_key => jt_key.split('|')[1]),
                latest: true,
                limit: jt_count
              }
              const query = getQueryArrayString(jettonReq, true);
              const { data } = await apiRequest(`/accounts?${query}`, 'GET')
              const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
                (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
              if (parsed.results && parsed.results.length > 0)
                for (const acc of parsed.results) {
                  this.processAccount(acc)
                  this.jettonWallets[`${hex}|${acc.address.hex}`].name = acc.content_name ?? 'Unnamed minter'
                }
            } catch (error) {
              console.log(error)
            }
        } catch (error) {
          console.log(error)
        }
        // get all nft_item of account
      }
    }
  })
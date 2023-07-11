import { parseJson } from '@ton.js/json-parser';

export const useMainStore = defineStore('tonexp', {
    state: () => ({
      // Maps to store blocks / messages / transactions / accounts efficiently
      blocks: {} as BlockMap,
      messages: {} as MessageMap,
      transactions: {} as TransactionMap,
      transactionMsgFlag: {} as { [key: TransactionKey] : boolean },
      transactionHexes: {} as { [key: string] : TransactionKey},
      accounts: {} as AccountMap,
      accountBases: {} as { [key: string] : AccountKey},
      // wallets and nfts
      jettonWallets: {} as JettonWalletMap,
      nftItems: {} as NFTMap,
      // Arrays with keys to fetch the correct info from maps
      latestBlocks: [] as BlockKey[],
      latestTransactions: [] as TransactionKey[],
      // Arrays with keys for loading info from api
      exploredBlocks: [] as BlockKey[],
      exploredTransactions: [] as TransactionKey[],
      exploredMessages: [] as MessageKey[],
      exploredAccounts: [] as AccountKey[],
      // Total number of resutls left for the api queries
      totalQueryTransactions: 0 as number,
      totalQueryMessages: -1 as number,
      totalQueryBlocks: 0 as number,
      totalQueryAccounts: -1 as number,
      totalQuerySearch: 0 as number,
      // Flag for NFT
      loadNextNFTFlag: true,
      // search results
      lastSearch: null as  BlockSearch | TxSearch | AccSearch | LabelSearch | null,
      searchResults: [] as Search,
      // Statistics.
      stats : {} as Statistics,
      // Interfaces
      interfaces : {} as ContractInterfaceMap,
      operations : {} as ContractOperationMap,
      // Graphs
      lastAvailableTimestamp: 0 as number,
      startupTime: new Date().getTime() as number,
      messageGraphData : [] as GraphCell[],
      transactionGraphData: [] as GraphCell[]
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
      },
      getWallets: (state) => (jt_keys: JettonWalletKey[]) => jt_keys.filter(key => key in state.jettonWallets).map(key => state.jettonWallets[key]),
      getNFTs: (state) => (nft_keys: NFTKey[]) => nft_keys.filter(key => key in state.nftItems).map(key => state.nftItems[key]),
      nextPageFlag: (state) => (loaded: number, type: string) => {
        switch (type) {
          case 'trn': return loaded >= state.totalQueryTransactions;
          case 'block': return loaded >= state.totalQueryBlocks;
          case 'acc': return loaded >= state.totalQueryAccounts;
          case 'msg': return loaded >= state.totalQueryMessages;
          case 'src': return loaded >= state.totalQuerySearch;
          default: return false;
        }
      },
    },
    actions: {
      blockKeyGen: (workchain: number, shard: bigint, seq_no: number) : BlockKey => `${workchain}:${shard}:${seq_no}`,
      convertBase64ToHex: (value: string) => {
        if (process.server) {
          return Buffer.from(value, 'base64').toString('hex');
        } else {
          const raw = atob(value);
          let result = '';
          for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16);
            result += (hex.length === 2 ? hex : '0' + hex);
          }
          return result
        }
      },
      processAccount(account: AccountAPI) {
        const accountKey = account.address.hex

        // Don't override account if the stored state matched given
        if (accountKey in this.accounts) {
          if (this.accounts[accountKey].block_seq_no > account.block_seq_no) return accountKey
        }

        const mappedAccount = <Account>{}
        mappedAccount.nft_keys = []
        mappedAccount.minted_nfts = []
        mappedAccount.jetton_wallets = []
        mappedAccount.transaction_keys = []
        mappedAccount.transaction_amount = 0
        mappedAccount.jetton_amount = 0
        mappedAccount.nft_amount = 0
        mappedAccount.minted_amount = 0

        this.accountBases[account.address.base64] = accountKey

        Object.assign(mappedAccount, account)

        this.accounts[accountKey] = mappedAccount
        return accountKey
      },
      processMessage(message: MessageAPI, tr_key: TransactionKey | null, tr_type: 'src' | 'dst' | null, parseAccounts: boolean = true) {
        const messageKey = message.hash

        // Don't override messages
        if (messageKey in this.messages) {
          if (tr_key) {
            if (tr_type === 'dst' && (this.messages[messageKey].dst_tx_key === null || this.messages[messageKey].dst_tx_key?.includes('|'))) this.messages[messageKey].dst_tx_key = tr_key
            if (tr_type === 'src' && (this.messages[messageKey].src_tx_key === null || this.messages[messageKey].src_tx_key?.includes('|'))) this.messages[messageKey].src_tx_key = tr_key
          }
          return messageKey
        }
        if (message.type === 'EXTERNAL_IN' && message.src_address) delete message.src_address
        if (message.type === 'EXTERNAL_OUT' && message.dst_address) delete message.dst_address
        const mappedMessage = <Message>{}

        mappedMessage.src_tx_key = (message.src_tx_lt && message.src_address) ?  `${message.src_address.base64}|${message.src_tx_lt}` : null
        mappedMessage.dst_tx_key = (message.dst_tx_lt && message.dst_address) ?  `${message.dst_address.base64}|${message.dst_tx_lt}` : null

        if (tr_type === 'src' && tr_key) mappedMessage.src_tx_key = tr_key
        if (tr_type === 'dst' && tr_key) mappedMessage.dst_tx_key = tr_key
        
        if (message.src_state) {
          if (parseAccounts) mappedMessage.src_state_key = this.processAccount(message.src_state)
          else mappedMessage.src_state_key = message.src_state.address.hex
          delete message.src_state
        }
        if (message.dst_state) {
          if (parseAccounts) mappedMessage.dst_state_key = this.processAccount(message.dst_state)
          else mappedMessage.src_state_key = message.dst_state.address.hex
          delete message.dst_state
        }
        
        Object.assign(mappedMessage, message)

        this.messages[messageKey] = mappedMessage
        return messageKey
      },
      processTransaction(transaction: TransactionAPI, parseAccount: boolean = true) {
        const transactionKey = transaction.hash

        // Don't override transactions
        if (transactionKey in this.transactions) return transactionKey

        const mappedTransaction = <Transaction>{}
        mappedTransaction.hex = this.convertBase64ToHex(transactionKey)
        this.transactionHexes[mappedTransaction.hex] = transactionKey
        mappedTransaction.out_msg_keys = []
        mappedTransaction.delta = 0n + BigInt(transaction.in_amount ?? 0n) - BigInt(transaction.out_amount ?? 0n)
        mappedTransaction.msg_fees = null

        let op_type: OPKey = 0

        if (transaction.account) {
          if (parseAccount) mappedTransaction.account_key = this.processAccount(transaction.account)
          else mappedTransaction.account_key = transaction.account.address.hex
          delete transaction.account
        }
        if (transaction.in_msg) {
          this.processMessage(transaction.in_msg, transactionKey, 'dst', parseAccount)
          if (transaction.in_msg.fwd_fee) {
            mappedTransaction.msg_fees = transaction.in_msg.fwd_fee
          }
          transaction.in_msg.operation_name ? op_type = transaction.in_msg.operation_name :
            (transaction.in_msg.operation_id ? op_type = `Contract op=${opToHex(transaction.in_msg.operation_id)}` : op_type = 1)
          delete transaction.in_msg
        }
        if (transaction.out_msg !== undefined) {
          if (transaction.out_msg?.length)
            mappedTransaction.out_msg_keys.push(...transaction.out_msg.map(msg => {
              if (msg.fwd_fee) {
                if (mappedTransaction.msg_fees) mappedTransaction.msg_fees += msg.fwd_fee
                else mappedTransaction.msg_fees = msg.fwd_fee
              }
              msg.operation_name ? ( (op_type ===0 || op_type === 1) ? op_type = msg.operation_name : op_type = 99) :
                (msg.operation_id ? ( (op_type ===0 || op_type === 1) ? op_type = `Contract op=0x${opToHex(msg.operation_id)}` : op_type = 99) :
                  op_type = 2)
              return this.processMessage(msg, transactionKey, 'src', parseAccount)
            }))
          delete transaction.out_msg
        }

        mappedTransaction.full_fees = (transaction.total_fees ?? 0n) + (mappedTransaction.msg_fees ?? 0n)
        mappedTransaction.op_type = op_type
        Object.assign(mappedTransaction, transaction)

        this.transactions[transactionKey] = mappedTransaction
        this.transactionMsgFlag[transactionKey] = false
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
        this.stats = {} as Statistics
        const mobi = isMobile()
        this.latestBlocks = []
        try {
          const latestReq = {
            workchain: -1,
            with_transactions: true,
            order: 'DESC',
            limit: mobi ? 5 : 10
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
          await this.updateTransactions(mobi ? 5 : 10, null, { 'workchain' : 0 })
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
            if (!route.query.hash) {
              await this.updateTransactions(20, null, null)
            } else {
              const hash = route.query.hash && toBase64Rfc(route.query.hash.toString())
              if (hash) await this.fetchTransaction(hash)
            }
            break;
          }
          case '/messages': {
            await this.updateMessages(10, null, null)
          }
          case '/accounts': {
            if (Object.entries(route.query).length === 0 || 'contract' in route.query) {
              const sq = route.query.contract ? route.query.contract.toString() : null

              await this.updateAccounts(20, null, sq)
            }  else {
              const hex = route.query.hex && route.query.hex.toString()
              if (hex) await this.fetchAccount(hex)
            }
            break;
          }
        }
        if (Object.keys(this.interfaces).length === 0) {
          try {
            const { data } = await apiRequest(`/contracts/interfaces`, 'GET')
            const parsed = parseJson<ContractInterfaceAPI>(data, (key, value, context) => (
                (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
            for (const inter of parsed.results) {
              this.interfaces[inter.name] = inter
            }
          } catch (error) {
            console.log(error)
          }
        }
        if (Object.keys(this.operations).length === 0) {
          try {
            const { data } = await apiRequest(`/contracts/operations`, 'GET')
            const parsed = parseJson<ContractOperationAPI>(data, (key, value, context) => (
                (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
            for (const oper of parsed.results) {
              this.operations[oper.operation_name] = oper
            }
          } catch (error) {
            console.log(error)
          }
        }
      },
      async updateBlockValues(limit: number = 10, seqOffset: number | null, cutPage: number = 0, order: "ASC" | "DESC" = "DESC") {
        const fullReq: MockType = {
          workchain: -1,
          with_transactions: true,
          order,
          limit
        }
        if (seqOffset) {
          fullReq.after = seqOffset
          this.exploredBlocks = this.exploredBlocks.slice(0, limit*cutPage)
        }
        if (!seqOffset) this.exploredBlocks = []
        const query = getQueryString(fullReq, false)
        try {
          const { data } = await apiRequest(`/blocks?${query}`, 'GET')
          const parsed = parseJson<BlockAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          
          this.totalQueryBlocks = parsed.total
          for (const key in parsed.results) {
            const block = this.processBlock(parsed.results[key])
            this.exploredBlocks.push(block)
            this.exploredBlocks.push(...this.blocks[block].shard_keys)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async getMessagesChart(metric: 'message_count' | 'message_amount_sum', interval: IntervalAPI, filters: MockType | null, reset: boolean = false, setEnd : boolean = false) {
        const fullReq: MockType = {
          ...filters,
          interval,
          metric
        }
        let newArr: GraphCell[] = reset ? [] : [...this.messageGraphData]
        const query = getQueryString(fullReq, true)
        try {
          const { data } = await apiRequest(`/messages/aggregated/history?${query}`, 'GET')
          const parsed = parseJson<MessageGraphAPI>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (parsed.count_results) newArr = [...newArr, ...parsed.count_results]
          if (parsed.sum_results) newArr = [...newArr, ...parsed.sum_results]
          this.messageGraphData = this.removeDuplicates(newArr).sort((a, b) => a.Timestamp > b.Timestamp ? 1 : -1)
          if (setEnd) this.lastAvailableTimestamp = new Date(this.messageGraphData[this.messageGraphData.length - 1].Timestamp).getTime()
        } catch (error) {
          console.log(error)
        }
      },
      async updateMessages(limit: number, seqOffset: bigint | null, filters: MockType | null, order: "ASC" | "DESC" = "DESC") {
        const fullReq: MockType = {
          order,
          limit,
          ...filters
        }
        if (seqOffset) fullReq.after = seqOffset
        if (!seqOffset) this.exploredMessages = []
        const query = getQueryString(fullReq, true)
        try {
          const { data } = await apiRequest(`/messages?${query}`, 'GET')
          const parsed = parseJson<MessageAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          
          this.totalQueryMessages = parsed.total
          if (!seqOffset) this.exploredMessages = []
          if (parsed.results && parsed.results.length > 0)
            for (const msg of parsed.results) {
              const key = this.processMessage(msg, null, null)
              this.exploredMessages.push(key)
            }
        } catch (error) {
          console.log(error)
        }
      },
      async updateTransactions(limit: number, seqOffset: bigint | null, filters: MockType | null, account: AccountKey | null = null, order: "ASC" | "DESC" = "DESC") { 
        const fullReq: MockType = {
          ...filters,
          order, 
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        if (!seqOffset) this.exploredTransactions = []
        if (account) fullReq.address = account
        const query = getQueryString(fullReq, true)
        try {
          const { data } = await apiRequest(`/transactions?${query}`, 'GET')
          const parsed = parseJson<TransactionAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.totalQueryTransactions = parsed.total
          for (const key in parsed.results) {
            const trn = this.processTransaction(parsed.results[key], false)
            this.exploredTransactions.push(trn)
          }
          if (account) {
              this.accounts[account].transaction_amount = parsed.total
              this.accounts[account].transaction_keys = []
              this.accounts[account].transaction_keys.push(...this.exploredTransactions)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async getTransactionsChart(interval: IntervalAPI, excludeMC: boolean, from: string, to: string | null, reset: boolean = false, setEnd : boolean = false) {
        const fullReq: MockType = {
          interval,
          from,
          to,
          metric : 'transaction_count'
        }
        if (excludeMC) fullReq.workchain = 0

        let newArr: GraphCell[] = reset ? [] : [...this.transactionGraphData]
        const query = getQueryString(fullReq, true)
        try {
          const { data } = await apiRequest(`/transactions/aggregated/history?${query}`, 'GET')
          const parsed = parseJson<MessageGraphAPI>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (parsed.count_results) newArr = [...newArr, ...parsed.count_results]
          this.transactionGraphData = this.removeDuplicates(newArr).sort((a, b) => a.Timestamp > b.Timestamp ? 1 : -1)
          if (setEnd) this.lastAvailableTimestamp = new Date(this.transactionGraphData[this.transactionGraphData.length - 1].Timestamp).getTime()
        } catch (error) {
          console.log(error)
        }
      },
      async updateAccounts(limit: number, seqOffset: bigint | null, contract: string | null, order: "ASC" | "DESC" = "DESC") { 
        const fullReq: MockType = {
          order, 
          limit,
          latest : true
        }
        if (seqOffset) fullReq.after = seqOffset
        if (contract) fullReq.interface = contract
        if (!seqOffset) this.exploredAccounts = []

        const query = getQueryString(fullReq, false)
        try {
          const { data } = await apiRequest(`/accounts?${query}`, 'GET')
          const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.totalQueryAccounts = parsed.total
          if (!seqOffset) this.exploredAccounts = []
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
          if (parsed.results && parsed.results.length > 0) {
            const key = this.processBlock(parsed.results[0])
            this.fetchBareAccounts(this.getAccountKeys(this.getMessageKeys(this.deepTransactionKeys(key), true, true), false))
            return key
          } else return null
        } catch (error) {
          console.log(error)
        }
      },
      async fetchTransaction(hash: string) {
        let fullReq: MockType = {}
        if (hash.includes('|')) fullReq = { address: hash.split('|')[0], created_lt: hash.split('|')[1]}
        else fullReq = { hash }
        const query = getQueryString(fullReq, true);
        try {
          const { data } = await apiRequest(`/transactions?${query}`, 'GET')
          const parsed = parseJson<TransactionAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (parsed.results && parsed.results.length > 0) {
            this.processTransaction(parsed.results[0])
            if (hash !== parsed.results[0].hash) hash = parsed.results[0].hash
            await this.fetchBareAccounts(this.getAccountKeys(this.getMessageKeys([hash], true, true), false))
            return hash
          } else return null
        } catch (error) {
          console.log(error)
        }
        return hash
      },
      async fetchBareAccounts(hex: string[]) {
        // hex = hex.filter(key => !(key in badAddresses))
        if (hex.length === 0) return hex
        try {
          const fullReq: MockType = {
            address: hex,
            latest: true
          }
          const query = getQueryArrayString(fullReq, true);
          // get latest account state
            const { data } = await apiRequest(`/accounts?${query}`, 'GET')
            const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
                (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
            if (parsed.results && parsed.results.length > 0)
              parsed.results.forEach((acc: AccountAPI) => {
                this.processAccount(acc)
              })
          } catch (error) {
            console.log(error)
          }
        return hex
      },
      async fetchAccount(hex: string) {
        this.loadNextNFTFlag = false
        if (hex in this.accountBases) hex = this.accountBases[hex]
        if (!(hex in this.accounts))
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
            if (parsed.results && parsed.results.length > 0) {
              this.processAccount(parsed.results[0])
              if (hex !== parsed.results[0].address.hex) hex = parsed.results[0].address.hex
            } else return null
          } catch (error) {
            console.log(error)
          }
        // get first 10 transactions for account if they are empty
        if (this.accounts[hex]?.transaction_keys.length === 0)
          await this.updateTransactions(10, null, null, hex)
        // get all jetton_wallet of account
        if (this.accounts[hex]?.jetton_wallets.length === 0) {
          try {
            const req: MockType = {
              limit: 1,
              owner_address: hex,
              latest: true,
              order: "DESC",
              interface: "jetton_wallet"
            }
            const query = getQueryString(req, true);
            // get latest account state
              const { data } = await apiRequest(`/accounts?${query}`, 'GET')
              const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
                  (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
            this.accounts[hex].jetton_amount = parsed.total
            if (parsed.results && parsed.results.length > 0) {
                for (const jt of parsed.results) {
                  const jt_key = this.processAccount(jt)
                  this.accounts[hex].jetton_wallets.push(`${hex}|${jt_key}`)
                }
              }
            } catch (error) {
              console.log(error)
            }
        }
        // get 18 nft_item of account
        if (this.accounts[hex]?.nft_keys.length === 0)
          // await this.loadAccountNFTs(hex, 18)
          await this.loadAccountNFTAddresses(hex, true, false, 18, null, 0)
        // get 18 minted nft_item of account
        if (this.accounts[hex]?.minted_nfts.length === 0)
          await this.loadAccountNFTAddresses(hex, true, true, 18, null, 0)
        return hex
      },
      async loadAccountJettonWallets(account: AccountKey) {
        try {
          const { data } = await apiRequest(`accounts/${account}/jettons`, 'GET', {}, `https://tonapi.io/v2/`)
          const parsed = parseJson<JettonAPIData>(data, (key, value, context) => (
            (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.accounts[account].jetton_wallets = []
          for (const jetton of parsed.balances) {
            const jt_key: JettonWalletKey = `${account}|${jetton.wallet_address.address}`
            this.accounts[account].jetton_wallets.push(jt_key)
            this.jettonWallets[jt_key] = {
              jetton_balance: formatTons(Number(jetton.balance), jetton.jetton.decimals),
              minter_address: jetton.jetton.address,
              wallet_address: jetton.wallet_address.address,
              name: jetton.jetton.name ?? "Unnamed",
              symbol: jetton.jetton.symbol
            }
          }
        } catch (error) {
          console.log(error)
        }
      },
      async loadAccountNFTAddresses(account: AccountKey, preload: boolean, minterFlag: boolean, limit: number = 18, seqOffset: bigint | null, offset: number = 0) {
        try {
          const req: MockType = {
            limit,
            latest: true,
            order: "DESC",
            interface: "nft_item"
          }

          if (seqOffset) req.after = seqOffset
          minterFlag ? req.minter_address = account : req.owner_address = account

          const query = getQueryString(req, true);
          // get latest account state
          const { data } = await apiRequest(`/accounts?${query}`, 'GET')
          const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));

          minterFlag ? this.accounts[account].minted_amount = parsed.total : this.accounts[account].nft_amount = parsed.total
          if (offset === 0) minterFlag ? this.accounts[account].minted_nfts = [] : this.accounts[account].nft_keys = []

          if (parsed.results && parsed.results.length > 0)
            parsed.results.forEach((acc: AccountAPI) => {
              const acc_key = this.processAccount(acc)
              const nft_Key: NFTKey = `${account}|${acc_key}`
              minterFlag ? this.accounts[account].minted_nfts.push(nft_Key) : this.accounts[account].nft_keys.push(nft_Key)
            })
        } catch (err) {
          console.log(err)
        }

        if (!preload) await this.requestNFTBulk(account, minterFlag, limit, offset)

      },
      async requestNFTBulk(account: AccountKey, minterFlag: boolean, limit: number = 18, offset: number = 0) {
        const requestNFTs: string[] = []
        if (account in this.accounts) {
          if (minterFlag) {
            this.accounts[account].minted_nfts.slice(offset, offset + limit).map(item => item.split('|')[1]).forEach(
              (key) => { if (!(`${account}|${key}` in this.nftItems)) requestNFTs.push(key) })
            } else {
              this.accounts[account].nft_keys.slice(offset, offset + limit).map(item => item.split('|')[1]).forEach(
                (key) => { if (!(`${account}|${key}` in this.nftItems)) requestNFTs.push(key) })
            }
        }
        if (requestNFTs.length === 0) return
        try {
          const req = {
            account_ids: requestNFTs
          }
          const { data } = await apiRequest(`/nfts/_bulk`, 'POST', {}, `https://tonapi.io/v2/`, req)
          const parsed = parseJson<NFTAPIData>(data, (key, value, context) => (
            (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          
          for (const nft of parsed.nft_items) {
            const nft_Key: NFTKey = `${account}|${nft.address}`
            this.nftItems[nft_Key] = nft
          }
        } catch (err) {
          console.log(err)
        }
      },
      async search(req: BlockSearch | TxSearch | AccSearch | LabelSearch | null, limit : number = 20, useLastSearch: boolean = false, offset? : number): Promise<Search> {
        if (!offset) this.searchResults = []

        if (useLastSearch && this.lastSearch) req = this.lastSearch
        this.lastSearch = req

        if (!req) return this.searchResults

        if (req.type == 'label') {

          try {
            const fullReq: MockType = {
              name: req.value,
              limit,
              offset
            }
            const query = getQueryString(fullReq, true);
              // get latest account state
            const { data } = await apiRequest(`/labels?${query}`, 'GET')
            const parsed = parseJson<SearchAPIData>(data, (key, value, context) => (
                (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
            this.totalQuerySearch = parsed.total
            if (parsed.results && parsed.results.length > 0)
              parsed.results.forEach((acc: SearchAPI) => {
                this.searchResults.push({
                  type: 'label',
                  value: acc.address.hex,
                  show: acc.name
                })
              })
          } catch (err) {
            return this.searchResults
          }
        } else if (req.type == 'account') {

          if (req.value.hex in this.accounts) { this.searchResults = [req]; return this.searchResults }

          if (req.value.hex in this.accountBases) {
            this.searchResults = [{
              type: 'account',
              value: {
                hex: this.accountBases[req.value.hex]
              },
              show: req.value.hex
            }]
          } else {
            const key = await this.fetchAccount(req.value.hex)
            if (key) this.searchResults = [{
              type: 'account',
              value: {
                hex: key
              },
              show: req.value.hex
            }]
          }

        } else if (req.type === 'block') {

          if (this.blockKeyGen(req.value.workchain, req.value.shard, req.value.seq_no) in this.blocks) { this.searchResults = [req]; return this.searchResults }

          const key = await this.fetchBlock(req.value.workchain, req.value.shard, req.value.seq_no)
          if (key) this.searchResults = [{
            type: 'block',
            value: {
              workchain: this.blocks[key].workchain,
              shard: this.blocks[key].shard,
              seq_no: this.blocks[key].seq_no
            },
            show: this.blockKeyGen(req.value.workchain, req.value.shard, req.value.seq_no)
          }]
        } else if (req.type === 'transaction') {

          if (req.value.hash in this.transactions) { this.searchResults = [req]; return this.searchResults }

          if (req.value.hash in this.transactionHexes) {
            this.searchResults = [{
              type: 'transaction',
              value: {
                hash: this.transactionHexes[req.value.hash]
              },
              show: req.value.hash
            }]
          } else {
            const key = await this.fetchTransaction(req.value.hash)
            if (key) this.searchResults = [{
              type: 'transaction',
              value: {
                hash: key
              },
              show: req.value.hash
            }]
          }
        }
        return this.searchResults
      },
      removeDuplicates(arr: GraphCell[]) {
        return arr.filter((obj, index) =>
            arr.findIndex(
            (item) => item.Timestamp === obj.Timestamp
        ) === index)
    }
    }
  })
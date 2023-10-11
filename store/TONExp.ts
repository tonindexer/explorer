import { parseJson } from '@ton.js/json-parser';

export const useMainStore = defineStore('tonexp', {
    state: () => ({
      // Maps to store blocks / messages / transactions / accounts efficiently
      blocks: {} as BlockMap,
      messages: {} as MessageMap,
      transactions: {} as TransactionMap,
      transactionMsgFlag: {} as { [key: TransactionKey] : boolean },
      transactionHexes: {} as { [key: string] : TransactionKey},
      transactionComboKeys: {} as { [key: string] : TransactionKey},
      accounts: {} as AccountMap,
      accountBases: {} as { [key: string] : AccountKey},
      // wallets and nfts
      jettonHolders: {} as JettonHolderMap,
      nftHolders: {} as NFTHolderMap,
      metadata: {} as MetadataMap,
      metaRelations: {} as MetadataRelations,
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
      transactionGraphData: [] as GraphCell[],
      accountsGraphData: [] as GraphCell[],
      // Tree
      treeMap: {} as TreeMap,
      treeEdgeMap: {} as TreeEdgeMap,
      messageTreeKeys: {} as MessageReverseMap,
      txTreeKeys: {} as TxReverseMap,
      messageTreeDataMap: {} as MessageNodeMap,
      messageTreeEdgeMap: {} as MessageEdgeMap,
      // dashboard
      chartNames: {} as { [key: string] : string },
      chartXs: {} as { [key: string] : string },
      sankeyAddressMap: {} as { [key: string] : string },
      sankeyAmount: {} as { [key: string] : { sentTotal: number, sentTop: number, receivedTotal: number, receivedTop: number, data: SankeyData }},
      sankeyCount: {} as { [key: string] : { sentTotal: number, sentTop: number, receivedTotal: number, receivedTop: number, data: SankeyData }},
      telemintDashboard: [] as DashboardAPICell[],
      cexDashboard: [] as DashboardAPICell[],
      bridgeDashboard: [] as DashboardAPICell[],
      // Loader varibles
      isLoading: {
        search: false
      }
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
      getMetaItems: (state) => (keys: AccountKey[]) => {
        const output = {} as MetadataMap
        keys.filter(key => key in state.metadata).forEach(key => output[key] = state.metadata[key])
        return output
      },
      getMetaRelations: (state) => (keys: AccountKey[]) => {
        const output = {} as MetadataRelations
        keys.filter(key => key in state.metaRelations).forEach(key => output[key] = state.metaRelations[key])
        return output
      },
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
      isLoaded: (state) => (module: 'search') => {
        return state.isLoading[module]
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
        if (!(accountKey in this.accounts)) {
          mappedAccount.owned_nfts = []
          mappedAccount.minted_nfts = []
          mappedAccount.jetton_wallets = []
          mappedAccount.transaction_keys = []
          mappedAccount.transaction_amount = 0
          mappedAccount.jetton_amount = 0
          mappedAccount.nft_amount = 0
          mappedAccount.minted_amount = 0
          mappedAccount.loaded = false

          this.accountBases[account.address.base64] = accountKey
        }
        Object.assign(mappedAccount, account)

        if (accountKey in this.accounts)
          this.accounts[accountKey] = { ...this.accounts[accountKey], ...mappedAccount}
        else 
          this.accounts[accountKey] = mappedAccount
        return accountKey
      },
      processMessage(message: MessageAPI, tr_key: TransactionKey | null, tr_type: 'src' | 'dst' | null, parseAccounts: boolean = true) {
        const messageKey = message.hash

        // Don't override messages
        if (messageKey in this.messages) {
          if (tr_key) {
            if (tr_type === 'dst' && (this.messages[messageKey].dst_tx_key === null || this.messages[messageKey].dst_tx_key?.includes('~'))) this.messages[messageKey].dst_tx_key = tr_key
            if (tr_type === 'src' && (this.messages[messageKey].src_tx_key === null || this.messages[messageKey].src_tx_key?.includes('~'))) this.messages[messageKey].src_tx_key = tr_key
          }
          return messageKey
        }
        if (message.type === 'EXTERNAL_IN' && message.src_address) delete message.src_address
        if (message.type === 'EXTERNAL_OUT' && message.dst_address) delete message.dst_address
        const mappedMessage = <Message>{}

        mappedMessage.src_tx_key = (message.src_tx_lt && message.src_address) ?  `${message.src_address.base64}~${message.src_tx_lt}` : null
        mappedMessage.dst_tx_key = (message.dst_tx_lt && message.dst_address) ?  `${message.dst_address.base64}~${message.dst_tx_lt}` : null

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
                (msg.operation_id ? ( (op_type ===0 || op_type === 1) ? op_type = `Contract ${opToHex(msg.operation_id)}` : op_type = 99) :
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
        this.transactionComboKeys[`${mappedTransaction.address.base64}~${mappedTransaction.created_lt.toString()}`] = transactionKey

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
        // Will be updated with new landing page
        return
        // this.stats = {} as Statistics
        // const mobi = isMobile()
        // this.latestBlocks = []
        // try {
        //   const latestReq = {
        //     workchain: -1,
        //     with_transactions: true,
        //     order: 'DESC',
        //     limit: mobi ? 5 : 10
        //   }
        //   const query = getQueryString(latestReq, false)
        
        //   const { data } = await apiRequest(`/blocks?${query}`, 'GET')
        //   const parsed = parseJson<BlockAPIData>(data, (key, value, context) => (
        //       (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
        //   for (const key in parsed.results) {
        //     const block = this.processBlock(parsed.results[key])
        //     this.latestBlocks.push(block)
        //   }
        // } catch (error) {
        //   console.log(error)
        // }
        // try {
        //   await this.updateTransactions(mobi ? 5 : 10, null, 'base')
        // } catch (error) {
        //   console.log(error)
        // }
        // try {
        //   const { data } = await apiRequest(`/statistics`, 'GET')
        //   this.stats = JSON.parse(data);
        //   Object.keys(this.stats).forEach(key => {
        //     if (this.stats[key] instanceof Array) delete this.stats[key];
        //   });
        // } catch (error) {
        //   console.log(error)
        // }
      },
      async initLoad() {
        const route = useRoute()

        switch (route.name) {
          case 'index': {
            await this.mainPageLoad()
            break
          } 
          case 'blocks': {
            if (Object.entries(route.query).length !== 3) {
              await this.updateBlockValues(null, 10, null)
            } else {
              const wc = route.query.workchain && isNumeric(route.query.workchain) ? Number(route.query.workchain) : null
              const sh = route.query.shard  && isNumeric(route.query.shard) ? BigInt(route.query.shard.toString()) : null
              const sq = route.query.seq_no && isNumeric(route.query.seq_no) ? Number(route.query.seq_no) : null
              if (wc && sh && sq) await this.fetchBlock(wc, sh, sq)
            }
            break
          }
          case 'transactions': {
            await this.updateTransactions(20, null, null)
            break
          }
          case 'transactions-hash' : {
            const hash = route.params.hash && trnParse(route.params.hash.toString()) && toBase64Rfc(route.params.hash.toString())
            if (hash) await this.fetchTransaction(hash)
          }
          case 'accounts': {
            if (Object.entries(route.query).length === 0 || 'contract' in route.query) {
              const sq = route.query.contract ? route.query.contract.toString() : null

              await this.updateAccounts(20, null, { interface : sq })
            }
            break
          }
          case 'accounts-hex': {
            const hex = route.params.hex && route.params.hex.toString()
            if (hex) await this.fetchAccount(hex)

            break
          }
          case 'messages': {
            await this.updateMessages(10, null, null)
            break
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
      async updateBlockValues(workchain: 'main' | 'base' | null,limit: number = 10, seqOffset: number | null, cutPage: number = 0, order: "ASC" | "DESC" = "DESC") {
        const fullReq: MockType = {
          with_transactions: true,
          order,
          limit
        }
        if (workchain) fullReq.workchain = workchain === 'base' ? '0' : '-1'

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
            if (workchain !== 'main') this.exploredBlocks.push(...this.blocks[block].shard_keys)
          }
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
          const parsed = parseJson<GraphAPI>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (parsed.count_results) newArr = [...newArr, ...parsed.count_results]
          if (parsed.sum_results) newArr = [...newArr, ...parsed.sum_results]
          this.messageGraphData = this.removeDuplicates(newArr).sort((a, b) => a.Timestamp > b.Timestamp ? 1 : -1)
          if (setEnd && newArr.length) this.lastAvailableTimestamp = new Date(this.messageGraphData[this.messageGraphData.length - 1].Timestamp).getTime()
        } catch (error) {
          console.log(error)
        }
      },
      async updateTransactions(limit: number, seqOffset: bigint | null, workchain: 'main' | 'base' | null, account: AccountKey | null = null, order: "ASC" | "DESC" = "DESC") { 
        const fullReq: MockType = {
          order, 
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        if (!seqOffset) this.exploredTransactions = []
        if (account) fullReq.address = account
        if (workchain) fullReq.workchain = workchain === 'base' ? '0' : '-1'
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
              this.accounts[account].transaction_keys = []
              this.accounts[account].transaction_keys.push(...this.exploredTransactions)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async getTransactionsChart(interval: IntervalAPI, workchain: string | null, from: string, to: string | null, reset: boolean = false, setEnd : boolean = false) {
        const fullReq: MockType = {
          interval,
          from,
          to,
          metric : 'transaction_count'
        }
        if (workchain) fullReq.workchain = workchain

        let newArr: GraphCell[] = reset ? [] : [...this.transactionGraphData]
        const query = getQueryString(fullReq, true)
        try {
          const { data } = await apiRequest(`/transactions/aggregated/history?${query}`, 'GET')
          const parsed = parseJson<GraphAPI>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (parsed.count_results) newArr = [...newArr, ...parsed.count_results]
          this.transactionGraphData = this.removeDuplicates(newArr).sort((a, b) => a.Timestamp > b.Timestamp ? 1 : -1)
          if (setEnd && newArr.length) this.lastAvailableTimestamp = new Date(this.transactionGraphData[this.transactionGraphData.length - 1].Timestamp).getTime()
        } catch (error) {
          console.log(error)
        }
      },
      async updateAccounts(limit: number, seqOffset: bigint | null, filters: MockType | null, order: "ASC" | "DESC" = "DESC") { 
        const fullReq: MockType = {
          ...filters,
          order, 
          limit,
          latest : true
        }
        if (seqOffset) fullReq.after = seqOffset
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
      async getAccountsChart(interval: IntervalAPI, contract: string | null, from: string, to: string | null, reset: boolean = false, setEnd : boolean = false) {
        const fullReq: MockType = {
          interval,
          from,
          to,
          metric : 'active_addresses'
        }
        if (contract) fullReq.interface = contract

        let newArr: GraphCell[] = reset ? [] : [...this.accountsGraphData]
        const query = getQueryString(fullReq, true)
        try {
          const { data } = await apiRequest(`/accounts/aggregated/history?${query}`, 'GET')
          const parsed = parseJson<GraphAPI>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (parsed.count_results) newArr = [...newArr, ...parsed.count_results]
          this.accountsGraphData = this.removeDuplicates(newArr).sort((a, b) => a.Timestamp > b.Timestamp ? 1 : -1)
          if (setEnd && newArr.length) this.lastAvailableTimestamp = new Date(this.accountsGraphData[this.accountsGraphData.length - 1].Timestamp).getTime()
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
        if (hash.includes('~')) fullReq = { address: toBase64Web(hash.split('~')[0]), created_lt: hash.split('~')[1]}
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
      async composeTreeNodes (hash: string, treeKey: string) {
        if (hash in this.txTreeKeys) return

        if (hash in this.transactionComboKeys) {
          hash = this.transactionComboKeys[hash]
        }

        for (const msgKey of this.getMessageKeys([hash], true, true)) {
          if (msgKey in this.messageTreeKeys) continue
          
          const msg = this.messages[msgKey]

          if (!msg) continue
          
          let addData : MockType = {...msg.data}
          let height: number = 0
          // width in symbols
          // for add_data its (4*depth) spaces + 2 quotes + 1 colon + 1 space before + 2 quotes if not number + 1 comma if not last index
          let width: number = 0
          // default letter width for roboto mono 16px
          const letterWidth: number = 9.6
          const letterHeight: number = 16
          function widthCounter (key: string, value: string, index: number, objLength: number, depth: number) {
            let append = (isNumeric(value) ? 4 : 6) + (index !== objLength - 1 ? 1 : 0) + (depth * 4)
            if (value.length <= 49 - depth*4 ) {
              if (value.length + key.length + append > width) width = value.length + key.length + append
            } else {
              if (key.length + 49 - depth*4 + 3 + append > width) width = key.length + 49 - depth*4 + 3 + append
            }
          }
          if (addData && Object.keys(addData).length > 0) {
            height += 2
            for (const [index, key] of Object.keys(addData).entries()) {
              height += 1
              if (addData[key] ?? null) {
                if (typeof addData[key] === 'object') {
                  height += 1

                  for (const [index1, key1] of Object.keys(addData[key]).entries()) {
                    height += 1
                    const value1 = addData[key][key1].toString()

                    widthCounter(key1, value1, index1, Object.keys(addData[key]).length, 2)
                    
                    // if (addParse(value1)) continue

                    if (value1.length > 41) {
                      addData[key][key1] = value1.slice(0,41) + '...'
                    }

                  }
                } else {
                  const value = addData[key].toString()

                  widthCounter(key, value, index, Object.keys(addData).length, 1)
                  
                  // if (addParse(value)) continue

                  if (value.length > 45) {
                    addData[key] = value.slice(0,45) + '...'
                  }
                }
              }
              if (addData[key] && addParse(addData[key].toString())) continue
              if (addData[key]?.toString().length > 45) addData[key] = addData[key].toString().slice(0,45) + '...' 
            }
          }
          let titleLength = (msg.src_contract ? msg.src_contract.length : 0) + 
            (msg.src_contract && (msg.operation_name || msg.operation_id)? 2 : 0) +
              (msg.operation_name ? msg.operation_name.length : (msg.operation_id ? opToHex(msg.operation_id).length : 0))
          
          if (titleLength === 0) titleLength = 7
          // 24 padding + 2 border + 4 stripe
          width = ((titleLength > width * 0.875) ? titleLength : (width * 0.875)) * letterWidth + 24 + 2 + 4
          height = (height * letterHeight * 0.875 * 1.5) + 8 * (msg.data ? 2 : 1) + 2 + 24
          const newData: MessageNodeData = {
            add_data: msg.data ? addData : null,
            contract: msg.src_contract ?? null,
            op_name: msg.operation_id ? opToHex(msg.operation_id) : null,
            op_type: msg.operation_name ?? null
          }
          this.messageTreeDataMap[msgKey] = {
            id: msgKey,
            type: 'custom',
            position: { x: 100, y: 0},
            nodeWidth: width,
            nodeHeight: height,
            draggable: false,
            data: newData
          }
          this.messageTreeKeys[msgKey] = treeKey
          this.treeMap[treeKey].push(msgKey)
        }

        if (this.transactions[hash].in_msg_hash && this.transactions[hash].out_msg_keys.length > 0) {
          for (const outMsg of this.transactions[hash].out_msg_keys) {
            const edgeKey: EdgeKey = `${this.transactions[hash].in_msg_hash}:${outMsg}`
            if (!(edgeKey in this.messageTreeEdgeMap)) {

              const newEdge: MessageEdge = {
                id: edgeKey,
                source: this.transactions[hash].in_msg_hash,
                target: outMsg,
                draggable: false
              }

              this.messageTreeEdgeMap[edgeKey] = newEdge
              this.treeEdgeMap[treeKey].push(edgeKey)

            }
          }
        }

        this.txTreeKeys[hash] = treeKey
      },
      async addTreeTx (hash: string, treeKey: string) {
        if (hash in this.txTreeKeys) return hash

        if (!(hash in this.transactions)) {
          const tx_key = await this.fetchTransaction(hash)
          if (tx_key) hash = tx_key
          else return
        }

        await this.composeTreeNodes(hash, treeKey)

        if (this.transactions[hash].in_msg_hash) {
          const prevHash = this.messages[this.transactions[hash].in_msg_hash].src_tx_key
          if (prevHash) {
            await this.addTreeTx(prevHash, treeKey)
          }
        }
        for (const outKey of this.transactions[hash].out_msg_keys) {
          const nextHash = this.messages[outKey].dst_tx_key
          if (nextHash) {
            await this.addTreeTx(nextHash, treeKey)
          }
        }
      },
      async fetchMessageTree (hash: string) {
        if (hash in this.txTreeKeys) return this.txTreeKeys[hash]
        let treeKey = 'tree_' + (Object.keys(this.treeMap).length + 1)
        this.treeMap[treeKey] = []
        this.treeEdgeMap[treeKey] = []
        await this.addTreeTx(hash, treeKey)
        return treeKey
      },
      async fetchBareAccounts(hex: string[]) {
        // hex = hex.filter(key => !(key in badAddresses))
        if (hex.length === 0) return hex
        try {
          const fullReq: MockType = {
            address: hex,
            limit: 100,
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
      async loadSankeyDiagram(hex: string) {
        if (!(hex in this.sankeyCount)) {
          let loadAmountFlag = false
          // count request
          try {
            const fullReq: MockType = {
              address: hex,
              order_by: 'count',
              limit: 20
            }
            const query = getQueryString(fullReq, true);
            // get aggregated message data for account
              const { data } = await apiRequest(`/messages/aggregated?${query}`, 'GET')
              const parsed = parseJson<SankeyAPI>(data, (key, value, context) => value);
              if (parsed) {
                let receivedCount = [] as SankeyCell[]
                let receivedAmount = [] as SankeyCell[]
                if (parsed.received_count > 0 && parsed.received_from_address) {
                  parsed.received_from_address.filter(item => item.sender).forEach(item => {
                    if (!(truncString(item.sender.base64) in this.sankeyAddressMap)) this.sankeyAddressMap[truncString(item.sender.base64, 5, 4)] = item.sender.hex
                    receivedCount.push([ truncString(item.sender.base64, 5, 4), "This account", item.count])
                    receivedAmount.push([ truncString(item.sender.base64, 5, 4), "This account", Number(shortTON(item.amount))])
                  })
                }
                let sentCount = [] as SankeyCell[]
                let sentAmount = [] as SankeyCell[]
                if (parsed.sent_count > 0 && parsed.sent_to_address) {
                  parsed.sent_to_address.filter(item => item.receiver).forEach(item => {
                    if (!(truncString(item.receiver.base64) in this.sankeyAddressMap)) this.sankeyAddressMap[truncString(item.receiver.base64, 5, 5)] = item.receiver.hex
                    sentCount.push([ "This account", truncString(item.receiver.base64, 5), item.count])
                    sentAmount.push([ "This account", truncString(item.receiver.base64, 5), Number(shortTON(item.amount))])
                  })
                }
                if (receivedCount.length > 0) receivedCount = receivedCount.sort((a, b) => b[2] - a[2]).slice(0, 10)
                if (sentCount.length > 0) sentCount = sentCount.sort((a, b) => b[2] - a[2]).slice(0, 10)
       
                this.sankeyCount[hex] = {
                  data: [...receivedCount,...sentCount],
                  sentTotal: parsed.sent_count,
                  sentTop: sentCount.length > 0 ? sentCount.reduce((accumulator, object) => { return accumulator + object[2]; }, 0) : 0,
                  receivedTotal: parsed.received_count,
                  receivedTop: receivedCount.length > 0 ? receivedCount.reduce((accumulator, object) => { return accumulator + object[2]; }, 0) : 0
                } 


                if (receivedAmount.length > 0) receivedAmount = receivedAmount.sort((a, b) => b[2] - a[2]).slice(0, 10)
                if (sentAmount.length > 0) sentAmount = sentAmount.sort((a, b) => b[2] - a[2]).slice(0, 10)
                
                this.sankeyAmount[hex] = { 
                  data : [...receivedAmount, ...sentAmount],
                  sentTotal: Number(fullTON(parsed.sent_ton_amount)),
                  sentTop: sentAmount.length > 0 ? sentAmount.reduce((accumulator, object) => { return accumulator + object[2]; }, 0) : 0,
                  receivedTotal: Number(fullTON(parsed.received_ton_amount)),
                  receivedTop: receivedAmount.length > 0 ? receivedAmount.reduce((accumulator, object) => { return accumulator + object[2]; }, 0) : 0
                }

              } else return null
            } catch (error) {
              console.log(error)
            }
          if (loadAmountFlag) {
            try {
              const fullReq: MockType = {
                address: hex,
                order_by: 'amount',
                limit: 20
              }
              const query = getQueryString(fullReq, true);
              // get aggregated message data for account
              const { data } = await apiRequest(`/messages/aggregated?${query}`, 'GET')
              const parsed = parseJson<SankeyAPI>(data, (key, value, context) => value);
              if (parsed) {
                let receivedAmount = [] as SankeyCell[]
                if (parsed.received_count > 0 && parsed.received_from_address) {
                  parsed.received_from_address.filter(item => item.sender).forEach(item => {
                    receivedAmount.push([ truncString(item.sender.base64, 5, 4), "This account", Number(shortTON(item.amount))])
                  })
                }
                let sentAmount = [] as SankeyCell[]
                if (parsed.sent_count > 0 && parsed.sent_to_address) {
                  parsed.sent_to_address.filter(item => item.receiver).forEach(item => {
                    sentAmount.push([ "This account", truncString(item.receiver.base64, 5), Number(shortTON(item.amount))])
                  })
                }

                if (receivedAmount.length > 0) receivedAmount = receivedAmount.sort((a, b) => b[2] - a[2]).slice(0, 10)
                if (sentAmount.length > 0) sentAmount = sentAmount.sort((a, b) => b[2] - a[2]).slice(0, 10)

                this.sankeyAmount[hex] = { 
                  data : [...receivedAmount, ...sentAmount],
                  sentTotal: Number(fullTON(parsed.sent_ton_amount)),
                  sentTop: sentAmount.length > 0 ? sentAmount.reduce((accumulator, object) => { return accumulator + object[2]; }, 0) : 0,
                  receivedTotal: Number(fullTON(parsed.received_ton_amount)),
                  receivedTop: receivedAmount.length > 0 ? receivedAmount.reduce((accumulator, object) => { return accumulator + object[2]; }, 0) : 0,
                  
                }

              } else return null
            } catch (error) {
              console.log(error)
            }
          }
        }
      },
      async fetchAccount(hex: string, preload: boolean = true) {
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
        if (this.accounts[hex]?.loaded || !preload) return hex

        // load account statistics
        try {
          const fullReq: MockType = {
            address: hex,
            limit: 25
          }
          const query = getQueryString(fullReq, true);
          // get latest account state
          const { data } = await apiRequest(`/accounts/aggregated?${query}`, 'GET')
          const parsed = parseJson<AccountAPIStats>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (Object.keys(parsed).length !== 0) {
            if (parsed.transactions_count) {
              this.accounts[hex].transaction_amount = parsed.transactions_count
            }
            if (parsed.owned_jetton_wallets) {
              this.accounts[hex].jetton_amount = parsed.owned_jetton_wallets
            }
            if (parsed.owned_nft_items) {
              this.accounts[hex].nft_amount = parsed.owned_nft_items
            }
          }
        } catch (error) {
          console.log(error)
        }

        this.accounts[hex].loaded = true

        return hex
      },
      async loadTopHolders(hex: string, limit: number) {
        try {
          const fullReq: MockType = {
            minter_address: hex,
            limit
          }
          const query = getQueryString(fullReq, true);
          const { data } = await apiRequest(`/accounts/aggregated?${query}`, 'GET')
          const parsed = parseJson<HoldersAPI>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (parsed.items && parsed.owned_items) {
            this.nftHolders[hex] = {
              items: parsed.items,
              owned_items: parsed.owned_items,
              owners_count: parsed.owners_count
            }
          }

          if (parsed.wallets) {
            this.jettonHolders[hex] = {
              wallets: parsed.wallets,
              total_supply: parsed.total_supply,
              owned_balance: parsed.owned_balance
            }
          }

        } catch (error) {
          console.log(error)
        }
      },
      async loadAccountJettons(account: AccountKey, preload: boolean, limit: number = 18, seqOffset: bigint | null) {
        try {
          const req: MockType = {
            limit,
            latest: true,
            order: "DESC",
            interface: "jetton_wallet",
            owner_address: account
          }

          if (seqOffset) req.after = seqOffset

          const query = getQueryString(req, true);
          // get latest account state
          const { data } = await apiRequest(`/accounts?${query}`, 'GET')
          const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));

          this.accounts[account].jetton_amount = parsed.total
          if (!seqOffset) this.accounts[account].jetton_wallets = []

          if (parsed.results && parsed.results.length > 0) {
            const metaReq = [] as AccountKey[]
            parsed.results.forEach((acc: AccountAPI) => {
              const acc_key = this.processAccount(acc)

              const minter = acc.minter_address
              if (minter) metaReq.push(minter.hex)
              metaReq.push(acc.address.hex)
              
              if (minter && !(acc_key in this.metaRelations)) this.metaRelations[acc_key] = {owner: this.accounts[account].address, minter} 
              this.accounts[account].jetton_wallets.push(acc_key)
            })
            if (preload) await this.requestMetaBulk(metaReq)
          }
        } catch (err) {
          console.log(err)
        }
      },
      async loadAccountNFTs(account: AccountKey, preload: boolean, minterFlag: boolean, limit: number = 18, seqOffset: bigint | null) {
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
          if (!seqOffset) minterFlag ? this.accounts[account].minted_nfts = [] : this.accounts[account].owned_nfts = []

          if (parsed.results && parsed.results.length > 0) {
            const metaReq = [] as AccountKey[]
            parsed.results.forEach((acc: AccountAPI) => {
              const acc_key = this.processAccount(acc)

              const minter = acc.minter_address
              if (minter) metaReq.push(minter.hex)
              metaReq.push(acc.address.hex)
              
              if (minter && !(acc_key in this.metaRelations)) this.metaRelations[acc_key] = {owner: this.accounts[account].address, minter} 
              minterFlag ? this.accounts[account].minted_nfts.push(acc_key) : this.accounts[account].owned_nfts.push(acc_key)
            })
            if (preload) await this.requestMetaBulk(metaReq)
          }
        } catch (err) {
          console.log(err)
        }
      },
      async requestMetaBulk(hex: AccountKey[]) {
        if (hex.length === 0) return hex
        try {
          const fullReq: MockType = {
            address: [...new Set(hex)]
          }
          const query = getQueryArrayString(fullReq, true);
          // get latest account state
            const { data } = await apiRequest(`/metadata?${query}`, 'GET', {}, `https://anton.tools/api/v1/`)
            const parsed = parseJson<MetadataAPIData>(data, (key, value, context) => (
                (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
            if (parsed.results && parsed.results.length > 0)
              parsed.results.forEach((meta: MetadataAPI) => {
                this.metadata[meta.address.hex] = {
                  name: meta.name ?? truncString(meta.address.base64, 5),
                  symbol: meta.symbol ?? meta.name ?? '',
                  image_url: meta.server_error ? "" : (meta.image_url ?? ''),
                  decimals: meta.decimals ?? 9,
                  description: meta.description ?? 'No description'
                }
              })
              hex.filter(item => !(item in this.metadata)).forEach(item => {
                this.metadata[item] = {
                  name: "Not found",
                  symbol:'',
                  image_url: "",
                  decimals: 9,
                  description: "Not found"
                }
              })
          } catch (error) {
            console.log(error)
          }
        return hex
      },
      async search(req: BlockSearch | TxSearch | AccSearch | LabelSearch | null, limit : number = 20, useLastSearch: boolean = false, offset? : number): Promise<Search> {
        this.isLoading.search = true

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
            if (this.lastSearch?.value !== req.value) this.searchResults = []
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
          } finally {
            this.isLoading.search = false
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
            const key = await this.fetchAccount(req.value.hex, false)
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

        this.isLoading.search = false

        return this.searchResults
      },
      async loadDashboards(slug: dashboardName) {
        const { data } = await apiRequest(`/dashboard/${slug}/charts`, 'GET', {}, `https://superset.anton.tools/api/v1`)
        const parsed = parseJson<DashboardAPIData>(data, (key, value, context) => value)
        parsed.result.forEach(item => {
          this.chartXs[item.form_data.slice_id.toString()] = item.form_data.x_axis ?? 'timestamp' 
          this.chartNames[item.form_data.slice_id.toString()] = item.slice_name 
        })
        if (slug === 'telemint') this.telemintDashboard = [...parsed.result]
        else if (slug === 'cex') this.cexDashboard = [...parsed.result]
        else this.bridgeDashboard = [...parsed.result]
      },
      async fetchChart(req: StoredMetricReq | StoredChartReq | StoredTableReq) {
        try {
            if (req.req.form_data.slice_id in postProcessSetup && req.type === 'chart') req.req.queries[0].post_processing = postProcessSetup[req.req.form_data.slice_id]
            if (req.type === 'chart' && req.req.queries[0].orderby[0].includes('max_bid')) req.req.queries[0].filters = [
              {
                "col": "updated_at",
                "op": "TEMPORAL_RANGE",
                "val": "No filter"
              },
              {
                "col": "max_bid",
                "op": ">",
                "val": "0"
              },
              {
                "col": "max_bid",
                "op": "<",
                "val": "3000"
              }
            ]
            const { data } = await apiRequest(`/chart/data`, 'POST', {}, `https://superset.anton.tools/api/v1`, req.req)
            const parsed = parseJson<ChartAPIData>(data, (key, value, context) => value);
            const result: StoredChartData = {
              slice_id: req.req.form_data.slice_id.toString(),
              type: req.type,
              colnames: parsed.result[0].colnames,
              data: parsed.result[0].data
            }
            return result
        } catch (err) {
          console.log(err)
        }
        return null
      },
      removeDuplicates(arr: GraphCell[]) {
        return arr.filter((obj, index) =>
            arr.findIndex(
            (item) => item.Timestamp === obj.Timestamp
        ) === index)
      }
    }
  })
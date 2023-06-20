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
      exploredAccounts: [] as AccountKey[],
      // Total number of resutls left for the api queries
      totalQueryTransactions: 0 as number,
      totalQueryBlocks: 0 as number,
      totalQueryAccounts: 0 as number,
      // Flag for NFT
      loadNextNFTFlag: true,
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
      },
      nextPageFlag: (state) => (loaded: number, type: string) => {
        switch (type) {
          case 'trn': return loaded > state.totalQueryTransactions;
          case 'block': return loaded > state.totalQueryBlocks;
          case 'acc': return loaded > state.totalQueryAccounts;
          default: return false;
        }
      },
      getNFTs: (state) => (keys: NFTKey[]) => keys.map(key => state.nftItems[key])
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
        const mappedAccount = <Account>{}
        mappedAccount.nft_keys = []
        mappedAccount.jetton_wallets = []
        mappedAccount.transaction_keys = []

        // Don't override account if the stored state matched given
        if (accountKey in this.accounts) {
          if (this.accounts[accountKey].block_seq_no > account.block_seq_no) return accountKey
        }

        this.accountBases[account.address.base64] = accountKey

        Object.assign(mappedAccount, account)

        this.accounts[accountKey] = mappedAccount
        return accountKey
      },
      processMessage(message: MessageAPI, tr_key: TransactionKey | null, dir: 'IN' | 'OUT', parseAccounts: boolean = true) {
        const messageKey = message.hash

        // Don't override messages
        if (messageKey in this.messages) return messageKey

        const mappedMessage = <Message>{}
        mappedMessage.parent_tx_key = tr_key ?? 'parentless'

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
        let op_type: OPKey = 0

        if (transaction.account) {
          if (parseAccount) mappedTransaction.account_key = this.processAccount(transaction.account)
          else mappedTransaction.account_key = transaction.account.address.hex
          delete transaction.account
        }
        if (transaction.in_msg) {
          this.processMessage(transaction.in_msg, transactionKey, 'IN')
          transaction.in_msg.operation_name ? op_type = transaction.in_msg.operation_name :
            (transaction.in_msg.operation_id ? op_type = `Contract op=${opToHex(transaction.in_msg.operation_id)}` : op_type = 1)
          delete transaction.in_msg
        }
        if (transaction.out_msg !== undefined) {
          if (transaction.out_msg?.length)
            mappedTransaction.out_msg_keys.push(...transaction.out_msg.map(msg => {
              msg.operation_name ? ( (op_type ===0 || op_type === 1) ? op_type = msg.operation_name : op_type = 99) :
                (msg.operation_id ? ( (op_type ===0 || op_type === 1) ? op_type = `Contract op=0x${opToHex(msg.operation_id)}` : op_type = 99) :
                  op_type = 2)
              return this.processMessage(msg, transactionKey, 'OUT', parseAccount)
            }))
          delete transaction.out_msg
        }

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
          await this.updateTransactions(20, null, true)
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
              const hex = route.query.hex && route.query.hex.toString()
              if (hex) await this.fetchAccount(hex)
            }
            break;
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
      async updateTransactions(limit: number, seqOffset: bigint | null, excludeWC: boolean = false, account: AccountKey | null = null, order: "ASC" | "DESC" = "DESC") { 
        const fullReq: MockType = {
          order, 
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        if (!seqOffset) this.exploredTransactions = []
        if (excludeWC) fullReq.workchain = 0
        if (account) fullReq.address = account
        const query = getQueryString(fullReq, false)
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
      async updateAccounts(limit: number, seqOffset: bigint | null, order: "ASC" | "DESC" = "DESC") { 
        const fullReq: MockType = {
          order, 
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        if (!seqOffset) this.exploredAccounts = []

        const query = getQueryString(fullReq, false)
        try {
          const { data } = await apiRequest(`/accounts?${query}`, 'GET')
          const parsed = parseJson<AccountAPIData>(data, (key, value, context) => (
              (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.totalQueryAccounts = parsed.total
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
        const fullReq: MockType = {
          hash
        }
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
        hex = hex.filter(key => !(key in badAddresses))
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
          await this.updateTransactions(10, null, false, hex)
        // get all jetton_wallet of account
        try {
          const { data } = await apiRequest(`accounts/${hex}/jettons`, 'GET', {}, `https://tonapi.io/v2/`)
          const parsed = parseJson<JettonAPIData>(data, (key, value, context) => (
            (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          this.accounts[hex].jetton_wallets = []
          for (const jetton of parsed.balances) {
            const jt_key: JettonWalletKey = `${hex}|${jetton.wallet_address.address}`
            this.accounts[hex].jetton_wallets.push(jt_key)
            this.jettonWallets[jt_key] = {
              jetton_balance: formatTons(Number(jetton.balance), jetton.jetton.decimals) + ' ' + jetton.jetton.symbol,
              minter_address: jetton.jetton.address,
              wallet_address: jetton.wallet_address.address,
              name: jetton.jetton.name ?? "Unnamed"
            }
          }
        } catch (error) {
          console.log(error)
        }
        // get all nft_item of account
        await this.loadAccountNFTs(hex, 18)
        return hex
      },
      async loadAccountNFTs(address: AccountKey, limit: number = 18, offset: number = 0) {
        try {
          const req = {
            limit: limit + 1,
            offset,
            indirect_ownership: false
          }
          const query = getQueryString(req, true);
          const { data } = await apiRequest(`accounts/${address}/nfts?${query}`, 'GET', {}, `https://tonapi.io/v2/`)
          const parsed = parseJson<NFTAPIData>(data, (key, value, context) => (
            (key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)));
          if (offset === 0) this.accounts[address].nft_keys = []
          if (parsed.nft_items.length >= limit) {
            parsed.nft_items = parsed.nft_items.slice(0, limit)
            this.loadNextNFTFlag = true
          } else this.loadNextNFTFlag = false
          
          for (const nft of parsed.nft_items) {
            const nft_Key: NFTKey = `${address}|${nft.address}`
            this.accounts[address].nft_keys.push(nft_Key)
            this.nftItems[nft_Key] = nft
          }
        } catch (error) {
          console.log(error)
        }
      },
      async search(req: BlockSearch | TxSearch | AccSearch): Promise<Search> {
        if (req.type == 'account') {
          if (req.value.hex in this.accounts) return [req]

          if (req.value.hex in this.accountBases) {
            return [{
              type: 'account',
              value: {
                hex: this.accountBases[req.value.hex]
              },
              show: req.value.hex
            }] 
          }

          const key = await this.fetchAccount(req.value.hex)
          if (key) return [{
            type: 'account',
            value: {
              hex: key
            },
            show: req.value.hex
          }] 
          else return []
        } else if (req.type === 'block') {
          if (this.blockKeyGen(req.value.workchain, req.value.shard, req.value.seq_no) in this.blocks) return [req]

          const key = await this.fetchBlock(req.value.workchain, req.value.shard, req.value.seq_no)
          if (key) return [{
            type: 'block',
            value: {
              workchain: this.blocks[key].workchain,
              shard: this.blocks[key].shard,
              seq_no: this.blocks[key].seq_no
            },
            show: this.blockKeyGen(req.value.workchain, req.value.shard, req.value.seq_no)
          }] 
          else return []
        } else if (req.type === 'transaction') {
          if (req.value.hash in this.transactions) return [req]
          if (req.value.hash in this.transactionHexes) {
            return [{
              type: 'transaction',
              value: {
                hash: this.transactionHexes[req.value.hash]
              },
              show: req.value.hash
            }] 
          }
          const key = await this.fetchTransaction(req.value.hash)
          if (key) return [{
            type: 'transaction',
            value: {
              hash: key
            },
            show: req.value.hash
          }] 
            else return []
        } else return []
      }
    }
  })
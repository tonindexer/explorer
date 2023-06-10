import JSONBigInt from 'json-bigint'

export const useMainStore = defineStore('tonexp', {
    // a function that returns a fresh state
    state: () => ({
      totalBlocks: 0 as number,
      blocks: {} as BlockMap,
      messages: {} as MessageMap,
      transactions: {} as TransactionMap,
      accounts: {} as AccountMap,
      latestBlocks: [] as Array<BlockKey>,
      exploredBlocks: [] as BlockKey[],
      stats : {} as Statistics,
    }),
    getters: {
      getLatestBlocks: (state) => state.latestBlocks.map((key) => state.blocks[key]),
      getBlockShards: (state) => (key: BlockKey) => state.blocks[key].shard_keys.map((shardKey) => state.blocks[shardKey]),
      getBlockKeys: (state) => (keys: BlockKey[], excludeEmpty: boolean) => excludeEmpty ? keys.filter((item: BlockKey) => state.blocks[item].transaction_keys.length > 0) : keys,
      deepTransactionKeys: (state) => (key: BlockKey) => {
        const output: string[] = [...state.blocks[key].transaction_keys]
        state.blocks[key].shard_keys.forEach((shrd: BlockKey) => output.push(...state.blocks[shrd].transaction_keys))
        return output
      },
      messageKeys: (state) => (keys: TransactionKey[], in_: boolean, out_: boolean)  : MessageKey[] => {
        const output: MessageKey[] = []
        for (const key of keys) {
          if (key in state.transactions) {
            if (state.transactions[key].in_msg_hash && in_) output.push(state.transactions[key].in_msg_hash)
            if (out_) output.push(...state.transactions[key].out_msg_keys)
          }
        }
        return output
      }
    },
    actions: {
      blockKeyGen: (workchain: number, shard: bigint, seq_no: number) : BlockKey => `${workchain}:${shard}:${seq_no}`,
      processAccount(account: Account) {
        const accountKey = account.address.hex

        // Don't override account if the stored state matched given
        if (accountKey in this.accounts) {
          if (this.accounts[accountKey].block_seq_no === account.block_seq_no) return accountKey
        }

        this.accounts[accountKey] = account
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
            block.transactions.forEach((tr: TransactionAPI) => mappedBlock.transaction_delta += ((BigInt(tr.in_amount ?? 0n)) - BigInt(tr.out_amount ?? 0n)))
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
          const query = getQueryString(latestReq, false);
        
          let { data } = await apiRequest(`/blocks?${query}`, 'GET')
          data = JSONBigInt({useNativeBigInt: true}).parse(data)
          for (const key in data.results) {
            const block = this.processBlock(data.results[key])
            this.latestBlocks.push(block)
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
          } case '/blocks': {
            if (Object.entries(route.query).length === 0) {
              await this.updateBlockValues(10, null)
            } else {
              const wc = route.query.id && isNumeric(route.query.id) ? Number(route.query.id) : null
              const sh = route.query.shard  && isNumeric(route.query.id) ? BigInt(route.query.shard.toString()) : null
              const sq = route.query.seq_no && isNumeric(route.query.seq_no) ? Number(route.query.seq_no) : null
              if (wc && sh && sq) await this.fetchBlock(wc, sh, sq)
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
        const query = getQueryString(fullReq, false);
        try {
          let { data } = await apiRequest(`/blocks?${query}`, 'GET')
          data = JSONBigInt({useNativeBigInt: true}).parse(data)
          for (const key in data.results) {
            const block = this.processBlock(data.results[key])
            this.exploredBlocks.push(block)
            this.exploredBlocks.push(...this.blocks[block].shard_keys)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async fetchBlock(id: number, shard: bigint, seq_no: number) {
        const fullReq: MockType = {
          workchain: id? -1 : 0,
          shard,
          with_transactions: true,
          seq_no
        }
        const query = getQueryString(fullReq, false);
        try {
          let { data } = await apiRequest(`/blocks?${query}`, 'GET')
          data = JSONBigInt({useNativeBigInt: true}).parse(data)
          this.processBlock(data.results[0])
        } catch (error) {
          return null
        }
      }
    }
  })
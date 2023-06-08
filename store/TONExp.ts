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
      stats : {} as Statistics,
    }),
    getters: {
      getLatestBlocks: (state) => state.latestBlocks.map((key) => state.blocks[key]),
      getBlockShards: (state) => (key: BlockKey) => state.blocks[key].shard_keys.map((shardKey) => state.blocks[shardKey])
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
          mappedTransaction.in_msg_key = this.processMessage(transaction.in_msg)
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
      async initLoad() {
        const latestReq = {
          workchain: -1,
          with_transactions: true,
          order: 'DESC',
          limit: 10
        }
        const query = getQueryString(latestReq, false);
        try {
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
      async updateBlockValues(limit: number = 20, seqOffset: number | null, order: "ASC" | "DESC" = "DESC") {
        const fullReq: PayloadData = {
          workchain: -1,
          with_transactions: true,
          order,
          limit
        }
        if (seqOffset) fullReq.after = seqOffset
        const query = getQueryString(fullReq, false);
        try {
          const { data } = await apiRequest(`/blocks?${query}`, 'GET')
          this.pageBlocks = data.results;
        } catch (error) {
          console.log(error)
        }
      },
      async fetchBlock(id: number, shard: number, seq_no: number) {
        const fullReq: PayloadData = {
          workchain: id,
          with_transactions: true,
          seq_no
        }
        const query = getQueryString(fullReq, false);
        try {
          const { data } = await apiRequest(`/blocks?${query}`, 'GET')
          return data.results
        } catch (error) {
          return null
        }
      }
    }
  })
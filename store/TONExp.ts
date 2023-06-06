export const useMainStore = defineStore('tonexp', {
    // a function that returns a fresh state
    state: () => ({
      counter: 0,
      name: 'Eduardo',
      totalBlocks: 0 as number,
      blocks: {} as MockType,
      messages: {} as MockType,
      transactions: {} as MockType,
      accounts: {} as MockType,
      latestBlocks: [] as Array<string>,
      stats : {} as Statistics,
    }),
    // optional getters
    getters: {
      // getters receive the state as first parameter
      doubleCounter: (state) => state.counter * 2,
      // use getters in other getters
      doubleCounterPlusOne(): number {
        return this.doubleCounter + 1
      },
      parsedLatest(state): Array<MockType> {
        const output = []
        for (const blockKey of state.latestBlocks) {
            const oneBlock: SmallBlock = {
                workchain: state.blocks[blockKey].workchain,
                seq_no: state.blocks[blockKey].seq_no,
                shard: state.blocks[blockKey].shard,
                tr_count: state.blocks[blockKey].transaction_keys?.length ?? 0,
                tr_final: 0,
                shards: []
            }
            state.blocks[blockKey].transaction_keys?.forEach((tr: string) => oneBlock.tr_final += (state.transactions[tr].in_amount - state.transactions[tr].out_amount))
            if (state.blocks[blockKey].shard_keys?.length)
                for (const shardKey of state.blocks[blockKey].shard_keys) {
                    const oneShard: SmallShard = {
                        workchain: state.blocks[shardKey].workchain,
                        seq_no: state.blocks[shardKey].seq_no,
                        shard: state.blocks[shardKey].shard,
                        tr_count: state.blocks[shardKey].transaction_keys?.length ?? 0,
                        tr_final: 0,
                    }
                    state.blocks[shardKey].transaction_keys?.forEach((tr: string) => oneShard.tr_final += (state.transactions[tr].in_amount - state.transactions[tr].out_amount))
                    oneBlock.shards.push(oneShard)
                }
            output.push(oneBlock);
        }
        return output
      }
    },
    // optional actions
    actions: {
      reset() {
        // `this` is the store instance
        this.counter = 0
      },
      increment() {
         this.counter += 2
      },
      processMessage(item: MockType) {
        const messageName = item.hash
        this.messages[messageName] = item
        return messageName
      },
      processTransaction(item: MockType) {
        const transactionName = item.hash
        const transaction : MockType= {
          out_msg_keys: []
        }
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            if (key === 'in_msg' && item[key]) {
              transaction[key] = this.processMessage(item[key])
            } else if (key === 'out_msg' && item[key]) {
              item.out_msg.forEach((msg : MockType)=> {
                const msgKey = this.processMessage(msg)
                transaction.out_msg_keys.push(msgKey)
              })
            } else {
              transaction[key] = item[key]
            }
          }
        }
        this.transactions[transactionName] = transaction
        return transactionName
      },
      processBlock(item: MockType) {
        const blockName = `${item.workchain}:${item.shard}:${item.seq_no}`
        const block : MockType= {
          transaction_keys: [],
          shard_keys: []
        }
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            if (key === 'transactions' && item[key]) {
              item.transactions.forEach((trn : MockType)=> {
                const trnKey = this.processTransaction(trn)
                block.transaction_keys.push(trnKey)
              })
            } else if (key === 'shards' && item[key]) {
              item.shards.forEach((shard : MockType)=> {
                const shrdKey = this.processBlock(shard)
                block.shard_keys.push(shrdKey)
              })
            } else {
              block[key] = item[key]
            }
          }
        }
        this.blocks[blockName] = block
        return blockName
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
          const { data } = await apiRequest(`/blocks?${query}`, 'GET')
          for (const key in data.results) {
            const block = this.processBlock(data.results[key])
            this.latestBlocks.push(block)
          }
        } catch (error) {
          console.log(error)
        }
        try {
          const { data } = await apiRequest(`/statistics`, 'GET')
          this.stats = data;
          Object.keys(this.stats).forEach(key => {
            if (this.stats[key] instanceof Array) delete this.stats[key];
          });
        } catch (error) {
          console.log(error)
        }
      }
    },
  })
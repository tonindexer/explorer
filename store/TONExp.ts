export const useMainStore = defineStore('tonexp', {
    // a function that returns a fresh state
    state: () => ({
      counter: 0,
      name: 'Eduardo',
      totalBlocks: 0 as number,
      latestBlocks: [] as Array<Block>
    }),
    // optional getters
    getters: {
      // getters receive the state as first parameter
      doubleCounter: (state) => state.counter * 2,
      // use getters in other getters
      doubleCounterPlusOne(): number {
        return this.doubleCounter + 1
      },
      parsedLatest(state): Array<SmallBlock> {
        const output = []
        for (const block of state.latestBlocks) {
            const oneBlock: SmallBlock = {
                workchain: block.workchain,
                seq_no: block.seq_no,
                shard: block.shard,
                tr_count: block.transactions?.length ?? 0,
                tr_final: 0,
                shards: []
            }
            block.transactions?.forEach(tr => oneBlock.tr_final += (tr.in_amount - tr.out_amount))
            if (block.shards?.length)
                for (const shard of block.shards) {
                    const oneShard: SmallShard = {
                        workchain: shard.workchain,
                        seq_no: shard.seq_no,
                        shard: shard.shard,
                        tr_count: shard.transactions?.length ?? 0,
                        tr_final: 0,
                    }
                    shard.transactions?.forEach(tr => oneShard.tr_final += (tr.in_amount - tr.out_amount))
                    oneBlock.shards?.push(oneShard)
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
          this.latestBlocks = data.results;
          this.totalBlocks = data.total;
        } catch (error) {
          console.log(error)
        }
      }
    },
  })
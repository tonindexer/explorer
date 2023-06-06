export const useMainStore = defineStore('tonexp', {
    // a function that returns a fresh state
    state: () => ({
      totalBlocks: 0 as number,
      latestBlocks: [] as Array<Block>,
      lastLoadedBlock: 0 as number,
      pageBlocks: [] as Array<Block>,
      shardList: [] as Array<Shard>,
      transactionsList: [] as Array<Transaction>,
      stats : {} as Statistics
    }),
    // optional getters
    getters: {
      parsedBlocks: (state)  =>  (latest: boolean = true) => {
        const output = []
        for (const block of latest ? state.latestBlocks : state.pageBlocks) {
            const oneBlock: SmallBlock = {
                workchain: block.workchain,
                seq_no: block.seq_no, 
                shard: block.shard,
                tr_count: block.transactions?.length ?? 0,
                tr_final: 0,
                shards: [],
                scanned_at: block.scanned_at ?? null
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
                        scanned_at: shard.scanned_at ?? null
                    }
                    shard.transactions?.forEach(tr => oneShard.tr_final += (tr.in_amount - tr.out_amount))
                    oneBlock.shards?.push(oneShard)
                }
            output.push(oneBlock);
        }
        return output
      },
      combinedParcedBlock() : Array<SmallBlock> {
        let output: Array<SmallBlock | SmallShard> = []
        for (const block of this.parsedBlocks(false)) {
          output.push(block, ...block.shards?.length ? block.shards : [])
        }
        return output
      },
      pageBlocksIndexer(state) {
        let output: PayloadData = {}
        for (const [blindex, block] of state.pageBlocks.entries()) {
          output[`${block.workchain}:${block.shard}:${block.seq_no}`] = `${blindex}`
          if (block.shards?.length)
            for (const [shindex, shard] of block.shards.entries()) {
              output[`${shard.workchain}:${shard.shard}:${shard.seq_no}`] = `${blindex}:${shindex}`
            }
        }
        return output
      },

      pageSmallBlockFetcher()  { 
        return (id: string) : SmallShard | SmallBlock | null => {
          if (isNumeric(id)) return this.parsedBlocks(false)[Number(id)] ?? null
          else {
            const addr = id.split(':')
            if (isNumeric(addr[0]) && isNumeric(addr[1])) {
              const block: SmallBlock = this.parsedBlocks(false)[Number(addr[0])]
              if (block.shards?.length)
              return block.shards[Number(addr[1])]
            }
          }
          return null
        }
      },
      pageFullBlockFetcher()  { 
        return (id: string) : Block | Shard | null => {
          if (isNumeric(id)) return this.pageBlocks[Number(id)] ?? null
          else {
            const addr = id.split(':')
            if (isNumeric(addr[0]) && isNumeric(addr[1])) {
              const block: Block = this.pageBlocks[Number(addr[0])]
              if (block.shards?.length)
              return block.shards[Number(addr[1])]
            }
          }
          return null
        }
      }
    },
    // optional actions
    actions: {
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
          this.pageBlocks = data.results;
          this.totalBlocks = data.total;
        } catch (error) {
          console.log(error)
        }
        try {
          // 
          const { data } = await apiRequest(`/statistics`, 'GET')
          this.stats = data;
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
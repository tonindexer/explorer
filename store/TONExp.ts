export const useMainStore = defineStore('tonexp', {
    // a function that returns a fresh state
    state: () => ({
      totalBlocks: 0 as number,
      latestBlocks: [] as Array<Block>,
      lastLoadedBlock: 0 as number,
      pageBlocks: [] as Array<Block>,
      stats : {} as Statistics
    }),
    // optional getters
    getters: {
      parsedLatest: (state)  =>  (latest: boolean = true) => {
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
      combinedBlock() : Array<SmallBlock> {
        let output: Array<SmallBlock | SmallShard> = []
        for (const block of this.parsedLatest(false)) {
          output.push(block, ...block.shards?.length ? block.shards : [])
        }
        return output
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
      }
    }
  })
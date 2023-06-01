export const useMainStore = defineStore('tonexp', {
    // a function that returns a fresh state
    state: () => ({
      counter: 0,
      name: 'Eduardo',
      latestBlocks: []
    }),
    // optional getters
    getters: {
      // getters receive the state as first parameter
      doubleCounter: (state) => state.counter * 2,
      // use getters in other getters
      doubleCounterPlusOne(): number {
        return this.doubleCounter + 1
      },
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
          const req = await apiRequest(`/blocks?${query}`, 'GET')

          console.log(req)
        } catch (error) {
          console.log(error)
        }
      }
    },
  })
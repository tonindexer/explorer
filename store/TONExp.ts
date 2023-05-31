export const useMainStore = defineStore('tonexp', {
    // a function that returns a fresh state
    state: () => ({
      counter: 0,
      name: 'Eduardo',
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
      }
    },
  })
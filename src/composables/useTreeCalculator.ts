export const useTreeCalculator = (hash: string, treeKey: string) => {
  const store = useMainStore()


  function widthCounter (key: string, value: string, index: number, objLength: number, depth: number, width: number) {
    const append = (isNumeric(value) ? 4 : 6) + (index !== objLength - 1 ? 1 : 0) + (depth * 4)
    if (value.length <= 49 - depth*4 ) {
      return (value.length + key.length + append > width) ? value.length + key.length + append : width
    } else {
      return (key.length + 49 - depth*4 + 3 + append > width) ? key.length + 49 - depth*4 + 3 + append : width
    }
  }

  if (hash in store.txTreeKeys) return

  if (hash in store.transactionComboKeys) {
    hash = store.transactionComboKeys[hash]
  }

  for (const msgKey of store.getMessageKeys([hash], true, true)) {
    if (msgKey in store.messageTreeKeys) continue
    
    const msg = store.messages[msgKey]

    if (!msg) continue
    
    const addData : MockType = {...msg.data}
    let height: number = 0
    // width in symbols
    // for add_data its (4*depth) spaces + 2 quotes + 1 colon + 1 space before + 2 quotes if not number + 1 comma if not last index
    let width: number = 0
    // default letter width for roboto mono 16px
    const letterWidth: number = 9.6
    const letterHeight: number = 16

    if (addData && Object.keys(addData).length > 0) {
      height += 2
      for (const [index, key] of Object.keys(addData).entries()) {
        height += 1
        if (addData[key] ?? null) {
          let value = addData[key]
          if (typeof value !== 'object') {
            value = value.toString()

            width = widthCounter(key, value, index, Object.keys(addData).length, 1, width)
            
            if (value.length > 45) {
              addData[key] = value.slice(0,45) + '...'
            }
          }
          else {
            height += 1
            for (const [index1, key1] of Object.keys(addData[key]).entries()) {
              height += 1
              let value1 = value[key1]
              if (typeof value1 !== 'object') {
                value1 = value1.toString()

                width = widthCounter(key1, value1, index1, Object.keys(value).length, 2, width)

                if (value1.length > 41) {
                  addData[key][key1] = value1.slice(0,41) + '...'
                }
              }
              else {
                for (const [index2, key2] of Object.keys(addData[key][key1]).entries()) {
                  height += 1

                  const value2 = value1[key2].toString()
    
                  width = widthCounter(key2, value2, index2, Object.keys(value1).length, 3, width)
                  
                  if (value2.length > 37) {
                    addData[key][key1] = value2.slice(0,37) + '...'
                  }
                }
              }
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
    store.messageTreeDataMap[msgKey] = {
      id: msgKey,
      type: 'custom',
      position: { x: 100, y: 0},
      nodeWidth: width,
      nodeHeight: height,
      draggable: false,
      data: newData
    }
    store.messageTreeKeys[msgKey] = treeKey
    store.treeMap[treeKey].push(msgKey)
  }

  if (store.transactions[hash].in_msg_hash && store.transactions[hash].out_msg_keys.length > 0) {
    for (const outMsg of store.transactions[hash].out_msg_keys) {
      const edgeKey: EdgeKey = `${store.transactions[hash].in_msg_hash}:${outMsg}`
      if (!(edgeKey in store.messageTreeEdgeMap)) {

        const newEdge: MessageEdge = {
          id: edgeKey,
          source: store.transactions[hash].in_msg_hash,
          target: outMsg,
          draggable: false
        }

        store.messageTreeEdgeMap[edgeKey] = newEdge
        store.treeEdgeMap[treeKey].push(edgeKey)

      }
    }
  }

  store.txTreeKeys[hash] = treeKey
}
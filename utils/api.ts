type Query = {
  [key: string] : string | number | boolean | null
}

type QueryArray = {
  [key: string] : string[] | string | number | boolean

}

export function getQueryString (query: Query, caseSensitive: boolean) {
    if (!query) return ''
    return Object.keys(query).reduce((acc, key) => {
      if (query[key]=== null && key === 'is_active') return acc
      if ((!query[key] && !isNumeric(query[key])) && !['is_active','broadcast'].includes(key)) return acc
      const queryStr = caseSensitive ? String(query[key]) : String(query[key]).toLowerCase()
      const res = key === 'search_fields' ? queryStr : encodeURIComponent(queryStr)
      if (!res) return acc
      acc = acc ? acc + '&' : acc
      return acc + key + '=' + res
    }, '')
}

export function getQueryArrayString (query: QueryArray, caseSensitive: boolean) {
  if (!query) return ''
  return Object.keys(query).reduce((acc, key) => {
    if (query[key]=== null && key === 'is_active') return acc
    if ((!query[key] && !isNumeric(query[key])) && !['is_active','broadcast'].includes(key)) return acc
    if (query[key] instanceof Array) {
      const arr = query[key]
      if (Array.isArray(arr)) {
        let ret = ""
        for (const item of arr) {
          ret = ret ? ret + '&' : ret
          ret = ret + key + '=' + item
        }
        acc = acc ? acc + '&' : acc
        return acc + ret
      }
      return ""
    } else {
      const queryStr = caseSensitive ? String(query[key]) : String(query[key]).toLowerCase()
      const res = key === 'search_fields' ? queryStr : encodeURIComponent(queryStr)
      if (!res) return acc
      acc = acc ? acc + '&' : acc
      return acc + key + '=' + res
    }
  }, '')
}
import axios from "axios"

type Method =
  | 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK'

export function apiRequest (url: string, method: Method, headers = {}, baseURL? : string, data?: Object): any  {
    const runtimeConfig = useRuntimeConfig()
    const request = (resolve : any, reject: any) => {
      const base = baseURL? baseURL : runtimeConfig.public.tonUrl
      axios({
        baseURL : base,
        url,
        method,
        headers,
        data,
        transformResponse: [data  => data]
      })
        .then(resolve)
        .catch((err) => {
          console.debug(err)
          if (axios.isCancel(err)) {
          }
          if (err.code === 'ECONNABORTED') {
            // handle timeout maybe retry if such arguments available
          }
          reject(err)
        })
        // .finally(() => cancel && cancel.unset(source))
    }
    return new Promise(async (resolve, reject) => {
      return request(resolve, reject)
    })
}
interface Query {
  [key: string] : string | number | boolean
}

export function getQueryString (query: Query, caseSensitive: boolean) {
    if (!query) return ''
    return Object.keys(query).reduce((acc, key) => {
        if (query[key]=== null && key === 'is_active') return acc
        if (!query[key] && !['is_active','broadcast'].includes(key)) return acc
        const queryStr = caseSensitive ? String(query[key]) : String(query[key]).toLowerCase()
        const res = key === 'search_fields' ? queryStr : encodeURIComponent(queryStr)
        if (!res) return acc
        acc = acc ? acc + '&' : acc
        return acc + key + '=' + res
    }, '')
}

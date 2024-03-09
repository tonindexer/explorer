import axios from "axios"
import { parseJson } from '@ton.js/json-parser';
type Method = 'get' | 'GET' | 'post' | 'POST'

export const useApiRequest = async <T,>(url: string, method: Method, headers = {}, baseURL? : string, data?: Object) => {

    const runtimeConfig = useRuntimeConfig()

    const request = (resolve : any, reject: any) => {
      const base = baseURL? baseURL : runtimeConfig.public.tonUrl
      axios({
        baseURL : base,
        url,
        method,
        headers,
        data,
        transformResponse: [data  => 
          parseJson<T>(data, (key, value, context) => ((key in bigintFields && isNumeric(context.source) ? BigInt(context.source) : value)))
        ]
      })
        .then(resolve)
        .catch((err) => {
          reject(err)
        })
        // .finally(() => cancel && cancel.unset(source))
    }
    
    return new Promise<{ data: T }>((resolve, reject) => {
      return request(resolve, reject)
    })
}
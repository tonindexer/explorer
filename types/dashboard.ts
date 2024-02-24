export {};

declare global {
    type dashboardName = 'cex' | 'telemint' | 'bridge'

    type ChartColumnObject = {
        timeGrain?: string // form_data.time_grain_sqla
        columnType?: string // const for chart
        sqlExpression: string // form_data.x_axis
        label: string // form_data.x_axis
        expressionType: string // const
    }
    type MetricObject = MockType

    type AdhocFilter = {
        clause: string | "WHERE" | "HAVING"
        expressionType: string | "SQL"
        sqlExpression: string | null
        [key: string]: any | undefined
    }

    type BaseQueryAPIRequest = {
        columns: Array<ChartColumnObject | string> // if (form_data.all_columns) { ...form_data.all_columns } else { CONST Object + ...form_data.groupby }
        order_desc?: boolean // form_data.order_desc
        extras: {
            having: string
            where: string
        }
    }

    type MetricQueryAPIRequest = BaseQueryAPIRequest & {
        metrics: Object[] // [form_data.metric]
    }

    type ChartQueryAPIRequest = BaseQueryAPIRequest & {
        metrics: Array<Object | string> // form_data.metrics
        orderby: Array<string | Object | boolean>[] // ...form_data.metrics then append false and wrap into array
        row_limit: number // form_data.row_limit
        post_processing: Object[]
        series_columns: Array<ChartColumnObject | string> // form_data.groupby
        filters?: Object[]
    }

    type TableQueryAPIRequest = BaseQueryAPIRequest & {
        orderby: Array<string | Object | boolean>[]
        row_limit: number // form_data.row_limit
        row_offset: number
        series_columns?: Array<ChartColumnObject | string> // form_data.groupby
    }

    type BaseFormDataAPIRequest = {
        slice_id: number // id
        dashboards: number[] // form_data.dashboards
        dashboardId: number // 3 for 'telemint', 2 for 'cex', 6 for 'bridge'
    }

    type MetricFormDataAPIRequest = BaseFormDataAPIRequest & {
        metric: Object // form_data.metric
    }

    type ChartFormDataAPIRequest = BaseFormDataAPIRequest & {
        metrics: Array<Object | string> // form_data.metrics
        groupby: Array<ChartColumnObject | string> | string // form_data.groupby
        row_limit: number // form_data.row_limit
        order_desc: boolean // form_data.order_desc
        truncate_metric: boolean // form_data.truncate_metric
        show_empty_columns: boolean // form_data.show_empty_columns
    }

    type TableFormDataAPIRequest = BaseFormDataAPIRequest & {
        groupby: Array<ChartColumnObject | string> // form_data.groupby
        all_columns: Array<ChartColumnObject | string> // form_data.all_column
        row_limit: number // form_data.row_limit
        row_offset: number
    }

    type MetricAPIRequest = {
        datasource: {
            id: number
            type: string
        }

        queries: MetricQueryAPIRequest[]

        form_data: MetricFormDataAPIRequest

        result_format: 'json'
        result_type: 'full'
    }

    type ChartAPIRequest = {
        datasource: {
            id: number // form_data.datasource.split('__')[0]
            type: string // form_data.datasource.split('__')[1]
        }

        queries: ChartQueryAPIRequest[]

        form_data: ChartFormDataAPIRequest

        result_format: 'json'
        result_type: 'full'
    }

    type TableAPIRequest = {
        datasource: {
            id: number
            type: string
        }

        queries: TableQueryAPIRequest[]

        form_data: TableFormDataAPIRequest

        result_format: 'json'
        result_type: 'full'
    }

    type StoredMetricReq = {
        type: 'metric'
        req: MetricAPIRequest
    }

    type StoredChartReq = {
        type: 'chart'
        req: ChartAPIRequest
    }

    type StoredTableReq = {
        type: 'table'
        req: TableAPIRequest
    }

    type StoredRequests = Array<StoredMetricReq | StoredChartReq | StoredTableReq>

    type StoredTableRequestsMap = {
        [key: string] : TableAPIRequest
    }

    // Only important fields from API listed
    type DashboardFormData = {
        dashboards: number[]
        datasource: `${number}__${string}`
        adhoc_filters: AdhocFilter[]
        all_columns?: Array<ChartColumnObject | string>
        groupby: Array<ChartColumnObject | string>
        order_desc: boolean
        row_limit: number
        slice_id: number
        time_grain_sqla: string
        truncate_metric?: boolean
        show_empty_columns?: boolean
        order_by_cols?: string[]
        metrics?: Array<Object | string>
        timeseries_limit_metric?: Object
        metric?: Object
        x_axis?: string
        [key: string]: any | undefined
    }
    type DashboardAPICell = {
        cache_timeout: number | null
        certification_details: string | null
        certified_by: string | null
        changed_on: string
        description: string | null
        description_markeddown: string
        form_data: DashboardFormData
        id: number
        slice_name: string
        slice_url: string
    }

    type DashboardAPIData = {
        result: DashboardAPICell[]
    }

    type ChartAPIDataKey = 'created_at' | string
    // Listed only parsed data, everything else not really needed
    type ChartAPIData = {
        result: {
            colnames: string[]
            data: {
                [key: ChartAPIDataKey] : number
            }[]
        }[]
    }
    type DashboardSeries = {
        series: {
            name: string
            data: number[]
        }[]
        times: number[]
    }

    type StoredChartData = {
        type: 'metric' | 'chart' | 'table'
        slice_id: string
        colnames: string[]
        data: {
            [key: ChartAPIDataKey] : any
        }[]
    }

    type Series = {
        name: string
        data: number[]
    }
}
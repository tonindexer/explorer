export const parseDashboardData = (input: DashboardAPICell[], id: number) : StoredRequests => {
    const output = [] as StoredRequests
    for (const item of input) {
        // Metric branch
        if (item.form_data.metric) {
            const req: MetricAPIRequest = {
                datasource: {
                    id: Number(item.form_data.datasource.split('__')[0]),
                    type: item.form_data.datasource.split('__')[1]
                },
                queries: [{
                    columns: [],
                    order_desc: item.form_data.order_desc,
                    metrics: [item.form_data.metric],
                    extras: {
                        having: "",
                        where: ""
                    }
                }],
                form_data: {
                    slice_id: item.id,
                    dashboards: item.form_data.dashboards,
                    dashboardId: id,
                    metric: item.form_data.metric
                },
                result_format: 'json',
                result_type: 'full'
            }
            for (const adhoc of item.form_data.adhoc_filters) {
                if (adhoc.expressionType === 'SQL' && adhoc.sqlExpression) {
                    if (adhoc.clause === 'HAVING') req.queries[0].extras.having = adhoc.sqlExpression
                    if (adhoc.clause === 'WHERE') req.queries[0].extras.where = adhoc.sqlExpression
                }
            }
            if (item.form_data.x_axis) {
                req.queries[0].columns.push({
                        timeGrain: item.form_data.time_grain_sqla,
                        columnType: "BASE_AXIS",
                        sqlExpression: item.form_data.x_axis,
                        label: item.form_data.x_axis,
                        expressionType: "SQL"
                    })
            }
            output.push({
                type: 'metric',
                req
            })
        }
        // Table branch
        else if (item.form_data.all_columns) {
            const req: TableAPIRequest = {
                datasource: {
                    id: Number(item.form_data.datasource.split('__')[0]),
                    type: item.form_data.datasource.split('__')[1]
                },
                queries: [{
                    columns: item.id === 61 || item.id === 20 ? [...item.form_data.all_columns] : [...item.form_data.groupby],
                    order_desc: item.form_data.order_desc,
                    orderby: item.form_data.timeseries_limit_metric? ([[ item.form_data.timeseries_limit_metric, false ]]) : 
                        item.form_data.order_by_cols ? (
                            item.form_data.order_by_cols.includes('week') ? [['week', false]] : 
                                (item.form_data.order_by_cols.some(item => item.includes('created_at')) ? [['created_at', false]] : [])
                        ) : [],
                    row_limit: item.form_data.row_limit,
                    row_offset: 0,
                    series_columns: item.id === 61 ? undefined : item.form_data.groupby,
                    extras: {
                        having: "",
                        where: ""
                    }
                }],
                form_data: {
                    slice_id: item.id,
                    dashboards: item.form_data.dashboards,
                    dashboardId: id,
                    groupby: item.form_data.groupby,
                    all_columns: item.form_data.all_columns,
                    row_limit: item.form_data.row_limit, 
                    row_offset: 0   
                },
                result_format: 'json',
                result_type: 'full'
            }

            console.log(item.form_data.order_by_cols)
            for (const adhoc of item.form_data.adhoc_filters) {
                if (adhoc.expressionType === 'SQL' && adhoc.sqlExpression) {
                    if (adhoc.clause === 'HAVING') {
                        if (req.queries[0].extras.having) req.queries[0].extras.having += ' AND ' + adhoc.sqlExpression
                        else req.queries[0].extras.having = adhoc.sqlExpression
                    }
                    if (adhoc.clause === 'WHERE') {
                        if (req.queries[0].extras.where) req.queries[0].extras.where += ' AND ' + adhoc.sqlExpression
                        else req.queries[0].extras.where = adhoc.sqlExpression
                    }
                }
            }
            if (item.form_data.x_axis) {
                req.queries[0].columns.push({
                        timeGrain: item.form_data.time_grain_sqla,
                        columnType: "BASE_AXIS",
                        sqlExpression: item.form_data.x_axis,
                        label: item.form_data.x_axis,
                        expressionType: "SQL"
                    })
            }
            output.push({
                type: 'table',
                req
            })
        }
        // Chart branch
        else {
            const req: ChartAPIRequest = {
                datasource: {
                    id: Number(item.form_data.datasource.split('__')[0]),
                    type: item.form_data.datasource.split('__')[1]
                },
                queries: [{
                    columns: [...item.form_data.groupby],
                    order_desc: item.form_data.order_desc,
                    metrics: item.form_data.metrics ?? [],
                    orderby: id === 3 ? (item.form_data.x_axis? ([[ item.form_data.x_axis, false ]]) : []) : item.form_data.metrics?.map(item => [item, false]) ?? [],
                    row_limit: item.form_data.row_limit,
                    series_columns: item.form_data.groupby,
                    post_processing: [],
                    extras: {
                        having: "",
                        where: ""
                    }
                }],
                form_data: {
                    slice_id: item.id,
                    dashboards: item.form_data.dashboards,
                    dashboardId: id,
                    metrics: item.form_data.metrics ?? [],
                    groupby: item.form_data.groupby,
                    row_limit: item.form_data.row_limit,
                    order_desc: item.form_data.order_desc,
                    truncate_metric: item.form_data.truncate_metric ?? true,
                    show_empty_columns: item.form_data.show_empty_columns ?? true
                },
                result_format: 'json',
                result_type: 'full'
            }
            for (const adhoc of item.form_data.adhoc_filters) {
                if (adhoc.expressionType === 'SQL' && adhoc.sqlExpression) {
                    if (adhoc.clause === 'HAVING') {
                        if (req.queries[0].extras.having) req.queries[0].extras.having += ' AND ' + adhoc.sqlExpression
                        else req.queries[0].extras.having = adhoc.sqlExpression
                    }
                    if (adhoc.clause === 'WHERE') {
                        if (req.queries[0].extras.where) req.queries[0].extras.where += ' AND ' + adhoc.sqlExpression
                        else req.queries[0].extras.where = adhoc.sqlExpression
                    }
                }
            }
            if (item.form_data.x_axis) {
                req.queries[0].columns.push({
                        timeGrain: item.form_data.time_grain_sqla,
                        columnType: "BASE_AXIS",
                        sqlExpression: item.form_data.x_axis,
                        label: item.form_data.x_axis,
                        expressionType: "SQL"
                    })
            }
            output.push({
                type: 'chart',
                req
            })
        }
    }
    return output
}

export const parseMetricChart = (input: StoredChartData) => {
    return {
        value: Object.values(input.data[0])[0]
    }
}

export const parseChart = (input: StoredChartData, timecol: string) : { data: {[key :string] : Series}, times: number[] } => {
    const output = { data: {} as {[key :string] : Series}, times: [] as number[] }
    // create objects for data
    for (const item of input.colnames) {
        if (!(item === timecol)) output.data[item] = { name: item, data: []}
    }
    input.data = input.data.sort((a, b) => a[timecol] - b[timecol])
    for (const item of input.data) {
        for (const key in item) {
            if (key === timecol) output.times.push(item[key])
            else output.data[key].data.push(item[key])
        }
    }
    return output
}

export const postProcessSetup: { [key: string] : Object[]} = { 
    // Telegram Numbers Daily Average Sale Price  
    11 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [],
                "aggregates": {
                    "AVG(sale_price / 1e9)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // CEX Depositing Addresses
    13: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [],
                "aggregates": {
                    "uniqExact(src_address)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Telegram Numbers On Sale
    3 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "max_bid"
                ],
                "columns": [],
                "aggregates": {
                    "count": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Telegram Usernames Daily Sale Count
    27 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "timestamp"
                ],
                "columns": [
                    "sale_type"
                ],
                "aggregates": {
                    "count": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Centralized Exchange Outflow (Count)
    19: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "src_label"
                ],
                "aggregates": {
                    "count": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // CEX Withdrawing Addresses
    23: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [],
                "aggregates": {
                    "uniqExact(dst_address)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Centralized Exchange Inflow (Count)
    29: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "dst_label"
                ],
                "aggregates": {
                    "count": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Centralized Exchange Inflow (Volume)
    40: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "dst_label"
                ],
                "aggregates": {
                    "SUM(deposit_amount)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "SUM(deposit_amount)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Telegram Numbers Daily Active Buyers And Sellers
    37 :[
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [],
                "aggregates": {
                    "COUNT(DISTINCT buyer_address)": {
                        "operator": "mean"
                    },
                    "COUNT(DISTINCT seller_address)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Telegram Numbers Daily Sale Volume
    28 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "sale_type"
                ],
                "aggregates": {
                    "SUM(sale_price / 1e9)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "SUM(sale_price / 1e9)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Centralized Exchange Outflow (Volume)
    45 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "src_label"
                ],
                "aggregates": {
                    "SUM(withdrawal_amount)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "SUM(withdrawal_amount)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // TON Bridge Inflow, TON -> ETH (Volume)
    10: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "chain"
                ],
                "aggregates": {
                    "SUM(amount)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "SUM(amount)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // TON Bridge Inflow, TON -> ETH (Count)
    14: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "chain"
                ],
                "aggregates": {
                    "count()": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count()": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // TON Bridge Outflow, ETH -> TON (Volume)
    4 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "chain"
                ],
                "aggregates": {
                    "SUM(amount)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "SUM(amount)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // TON Bridge Outflow, ETH -> TON (Count)
    38: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "chain"
                ],
                "aggregates": {
                    "count": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // TON Bridge Depositing Addresses, TON -> ETH
    1: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "chain"
                ],
                "aggregates": {
                    "uniqExact(src_address)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "uniqExact(src_address)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // TON Bridge Withdrawing Addresses, ETH -> TON
    18: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "chain"
                ],
                "aggregates": {
                    "uniqExact(dst_address)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "uniqExact(dst_address)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Jetton Bridge Outflow, TON -> ETH (Volume)
    46: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "token"
                ],
                "aggregates": {
                    "SUM(jetton_amount)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "SUM(jetton_amount)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // TON Bridge Outflow, ETH -> TON (Count)
    5: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "token"
                ],
                "aggregates": {
                    "count()": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count()": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Jetton Bridge Sender Addresses, TON -> ETH
    17: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [],
                "aggregates": {
                    "uniqExact(sender)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Jetton Bridge Receiver Addresses, ETH -> TON
    6: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [],
                "aggregates": {
                    "uniqExact(dst_address)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Jetton Bridge Outflow, TON -> ETH (Count)
    42: [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "token"
                ],
                "aggregates": {
                    "count()": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count()": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Telegram Numbers Daily Sales Count
    31 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "created_at"
                ],
                "columns": [
                    "sale_type"
                ],
                "aggregates": {
                    "count": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "count": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    // Telegram Usernames Daily Sale Volume
    43 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "timestamp"
                ],
                "columns": [
                    "sale_type"
                ],
                "aggregates": {
                    "SUM(sale_price)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "rename",
            "options": {
                "columns": {
                    "SUM(sale_price)": null
                },
                "level": 0,
                "inplace": true
            }
        },
        {
            "operation": "flatten"
        }
    ],
    62 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "week"
                ],
                "columns": [],
                "aggregates": {
                    "argMax(total_balance, week)": {
                        "operator": "mean"
                    }
                },
                "drop_missing_columns": false
            }
        },
        {
            "operation": "flatten"
        }
    ],
}
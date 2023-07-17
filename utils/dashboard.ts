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
                    orderby: item.form_data.x_axis? ([[ item.form_data.x_axis, false ]]) : [],
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
    for (const item of input.data) {
        for (const key in item) {
            if (key === timecol) output.times.push(item[key])
            else output.data[key].data.push(item[key])
        }
    }
    return output
}

export const postProcessSetup: { [key: string] : Object[]} = {   
    6 : [
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "timestamp"
                ],
                "columns": [],
                "aggregates": {
                    "AVG(sale_price)": {
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
    10 : [
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
    11 : [
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
    31 :[
        {
            "operation": "pivot",
            "options": {
                "index": [
                    "timestamp"
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
    32 : [
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
    57 : [
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
    58 : [
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
}
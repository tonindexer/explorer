export const parseDashboardData = (input: DashboardAPICell[], id: number) : StoredRequests => {
    const output = [] as StoredRequests
    for (const item of input) {
        // Metric branch
        if (item.form_data.metric) {
            console.log(item.form_data)
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
    }
    return output
}
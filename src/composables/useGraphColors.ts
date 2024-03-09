export const useGraphColors = () => {
    const colorMode = useColorMode()

    const lightConfig = ref({
        axisLabelsColor: 'rgba(0, 0, 0, 0.5)',
        xAxisColor: 'white',
        gridLinesColor: 'rgba(0, 0, 0, 0.04)',
        gradientStartColor: 'rgba(174, 190, 253, 1)',
        gradientEndColor: 'rgba(44, 175, 254, 0)',
        graphColor: 'rgb(118, 146, 253)'
    })

    const drakConfig = ref({
        axisLabelsColor: 'rgba(255, 255, 255, 0.5)',
        xAxisColor: '#232323',
        gridLinesColor: 'rgba(255, 255, 255, 0.04)',
        gradientStartColor: 'rgba(129, 160, 255, 0.3)',
        gradientEndColor: 'rgba(32, 50, 106, 0)',
        graphColor: '#81A0FF'
    })

    const colors = computed(() => colorMode.value === 'dark' ? drakConfig.value : lightConfig.value)

    return { colors }
}
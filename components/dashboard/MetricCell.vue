<script setup lang="ts">
interface MetricData {
    name: string
    request_id: string
    data: {
        value : number | bigint
    }
}

const props = defineProps<MetricData>()
</script>


<template>
    <div class="uk-padding-small uk-background-muted metric">
        <div class="uk-text-default">
            {{ name }}
        </div>
        <div class="uk-text-large">
            {{ toCompact(data.value) }}
        </div>
    </div>

</template>
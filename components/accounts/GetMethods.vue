<script setup lang="ts">
interface Props {
    methods: {[key: string] : GetMethod[]}
}
const props = defineProps<Props>()

interface MethodValue {
    key: string
    value: any
    addr: boolean
    content: boolean
}

interface Method {
    name: string
    recieves: MethodValue[]
    returns: MethodValue[]
}

interface TableSection {
    title: string
    methods: Method[]
}

const parseData = computed((): TableSection[] => {
    const output: TableSection[] = []
    for (const key in props.methods) {
        const section: TableSection = {
            title: key,
            methods: []
        }
        for (const method of props.methods[key]) {
            const methodOut: Method = {
                name: method.name,
                recieves: [],
                returns: []
            }
            if (method.arguments && method.receives) {
                for (const [index, arg] of method.arguments.entries()) {
                    methodOut.recieves.push({
                        key: arg.name,
                        value: method.receives[index],
                        addr: arg.format && (arg.format === "addr") ? true : false,
                        content: arg.format && (arg.format === "content") ? true : false,
                    })
                }
            }
            for (const [index, arg] of method.return_values.entries()) {
                const value = method.returns[index]
                methodOut.returns.push({
                    key: arg.name,
                    value: typeof value === 'object' ? value.URI : value,
                    addr: arg.format && (arg.format === "addr") ? true : false,
                    content: arg.format && (arg.format === "content") ? true : false,
                })
            }
            section.methods.push(methodOut)
        }
        output.push(section)
    }
    return output
})

</script>

<template>
    <table class="uk-table uk-table-middle uk-margin-remove-top">
        <thead v-if="!isMobile()">
            <tr>
                <th class="uk-table-1-5" style="max-width: 20%;">{{ $t('general.field')}}</th>
                <th class="uk-table-expand" style="margin-right: 0.3rem;">{{ $t('general.value')}}</th>
            </tr>
        </thead>
        <tbody v-if="!isMobile()">
            <template v-for="section, index of parseData">
                <template v-for="method of section.methods">
                    <tr style="border-bottom: 1px solid #666" :style="index !== 0 ? 'border-top: 1px solid #666' : ''">

                        <td colspan="2">
                            <NuxtLink :to="`/accounts?contract=${section.title}`" class="uk-text-primary" uk-icon="icon:link" style="line-height: 1.5;">
                                {{ section.title }}
                            </NuxtLink>
                            <span>
                                {{ ' ➔ ' + method.name }}
                            </span>
                        </td>
                    </tr>
                    <template v-for="value of method.recieves" v-if="method.recieves.length > 0">
                        <tr style="border-bottom: 1px dashed #666;">
                            <td class="uk-width-1-5">
                                <div class="uk-text-small uk-text-bold">
                                    {{ $t('general.argument') }}
                                </div>
                                <div class="uk-margin-remove">
                                    {{ value.key }}
                                </div>
                            </td>
                            <td class="uk-flex">
                                <p v-if="!(value.addr && value.value !== 'NONE') && !value.content" class="uk-text-truncate uk-margin-remove"  style="max-width: calc(100vw * 0.75 * 0.75)">
                                    {{ value.value ? value.value : $t('general.empty') }}
                                </p>
                                <NuxtLink v-else-if="value.content" rel="external" aria-label="nft_link" :to="value.value" class="uk-text-primary uk-text-truncate uk-margin-remove"  style="max-width: calc(100vw * 0.75 * 0.75)">
                                    {{ value.value }}
                                </NuxtLink>
                                <NuxtLink v-else-if="value.addr" class="uk-text-primary" :to="`/accounts?hex=${value.value}`" style="max-width: calc(100vw * 0.75 * 0.75)"> 
                                    {{ value.value }}
                                </NuxtLink>
                            </td>
                        </tr>
                    </template>
                    <template v-for="value of method.returns" v-if="method.returns.length > 0">
                        <tr style="border-bottom: 1px dashed #666;">
                            <td class="uk-width-1-5">
                                <div class="uk-text-small uk-text-bold">
                                    {{ $t('general.return') }}
                                </div>
                                <div class="uk-margin-remove">
                                    {{ value.key }}
                                </div>
                            </td>
                            <td class="uk-flex">
                                <p v-if="!(value.addr && value.value !== 'NONE') && !value.content" class="uk-text-truncate uk-margin-remove"  style="max-width: calc(100vw * 0.75 * 0.75)">
                                    {{ value.value ? value.value : $t('general.empty') }}
                                </p>
                                <NuxtLink v-else-if="value.content" rel="external" :to="value.value" class="uk-text-primary uk-text-truncate uk-margin-remove"  style="max-width: calc(100vw * 0.75 * 0.75)">
                                    {{ value.value }}
                                </NuxtLink>
                                <NuxtLink v-else-if="value.addr" class="uk-text-primary uk-text-truncate" :to="`/accounts?hex=${value.value}`" style="max-width: calc(100vw * 0.75 * 0.75)"> 
                                    {{ value.value }}
                                </NuxtLink>
                            </td>
                        </tr>
                    </template>
                </template>
            </template>
        </tbody>
        <tbody v-else>
            <template v-for="section, index of parseData">
                <template v-for="method of section.methods">
                    <tr style="border-bottom: 1px solid #666" :style="index !== 0 ? 'border-top: 1px solid #666' : ''">
                        <AtomsPropLine>
                                <template #name>
                                    <NuxtLink :to="`/accounts?contract=${section.title}`" class="uk-text-primary" uk-icon="icon:link" style="line-height: 1.5;">
                                        {{ section.title }}
                                    </NuxtLink>
                                </template>
                                <template #value>
                                    {{ 'method: ' + method.name }}
                                </template>
                            </AtomsPropLine>
                    </tr>
                    <template v-for="value of [...method.recieves, ...method.returns]">
                        <tr style="border-bottom: 1px dashed #666;">
                            <AtomsPropLine>
                                <template #name>
                                    {{ value.key }}
                                </template>
                                <template #value>
                                    <p v-if="!(value.addr && value.value !== 'NONE') && !value.content" class="uk-text-truncate uk-margin-remove"  style="max-width: 90vw;">
                                        {{ value.value ? value.value : $t('general.empty') }}
                                    </p>
                                    <NuxtLink v-else-if="value.content" rel="external" aria-label="nft_link" :to="value.value" class="uk-text-primary uk-text-truncate uk-margin-remove"  style="max-width: 90vw;">
                                        {{ value.value }}
                                    </NuxtLink>
                                    <NuxtLink v-else-if="value.addr" class="uk-text-truncate uk-text-primary" style="max-width: 90vw;" :to="`/accounts?hex=${value.value}`"> 
                                        {{ value.value }}
                                    </NuxtLink>
                                </template>
                            </AtomsPropLine>
                        </tr>
                    </template>
                </template>
            </template>
        </tbody>
    </table>
</template>
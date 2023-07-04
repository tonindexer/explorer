<script setup lang="ts">
interface Props {
    methods: {[key: string] : GetMethod[]}
}
const props = defineProps<Props>()

interface MethodValue {
    key: string
    value: any
    format: string
    type: string
    addr: boolean
    content: boolean
}

interface Method {
    name: string
    error: string | null
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
                error: method.error ?? null,
                recieves: [],
                returns: []
            }
            if (method.arguments && method.receives) {
                for (const [index, arg] of method.arguments.entries()) {
                    methodOut.recieves.push({
                        key: arg.name,
                        value: method.receives[index],
                        type: arg.stack_type,
                        format:  arg.format ? arg.format.toString(): '',
                        addr: arg.format && (arg.format === "addr") ? true : false,
                        content: arg.format && (arg.format === "content") ? true : false,
                    })
                }
            }
            for (const [index, arg] of method.return_values.entries()) {
                const value = (!method.error && method.returns[index]) ? method.returns[index] : ''
                methodOut.returns.push({
                    key: arg.name,
                    value: typeof value === 'object' ? value.URI : value,
                    type: arg.stack_type,
                    format: arg.format ? arg.format.toString(): '',
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
    <div class="uk-flex uk-flex-column">
        <template v-for="section of parseData">
            <h4 class="uk-flex uk-margin-remove-bottom uk-margin-small-top">
                <NuxtLink :to="`/accounts?contract=${section.title}`" class="uk-text-bold uk-text-primary" uk-icon="icon:link" style="line-height: 1.5;">
                    {{ section.title }}
                </NuxtLink>
            </h4>
            <ul uk-accordion="multiple: true">
                <li v-for="method of section.methods" >
                    <a class="uk-accordion-title uk-text-truncate uk-text-default" href="#">
                        {{ method.name }}
                    </a>
                    <div class="uk-accordion-content">
                        <h4 class="uk-margin-small-left uk-margin-remove-vertical" v-if="method.recieves.length > 0">
                            {{ $t('general.arguments') }}
                        </h4>
                        <table class="uk-table uk-table-middle uk-table-divider uk-margin-remove-top" v-if="method.recieves.length > 0">
                            <thead v-if="!isMobile()">
                                <th class="uk-width-1-3">{{ $t('ton.name')}}</th>
                                <th class="uk-width-1-3">{{ $t('general.type')}}</th>
                                <th class="uk-width-1-3">{{ $t('general.format')}}</th>
                            </thead>
                            <tbody>
                                <tr v-for="value of method.recieves">
                                    <AtomsPropLine :third="value.format">
                                        <template #name>
                                            {{ value.key }}
                                        </template>
                                        <template #value>
                                            {{ value.type }}
                                        </template>
                                    </AtomsPropLine>
                                </tr>
                            </tbody>
                        </table>   

                        <h4 class="uk-margin-small-left uk-margin-remove-vertical" v-if="method.returns.length > 0">
                            {{ $t('general.returns') }}
                        </h4>
                        <table class="uk-table uk-table-middle uk-table-divider uk-margin-remove-top" v-if="method.returns.length > 0">
                            <thead v-if="!isMobile()">
                                <th class="uk-width-1-3">{{ $t('ton.name')}}</th>
                                <th class="uk-width-1-3">{{ $t('general.type')}}</th>
                                <th class="uk-width-1-3">{{ $t('general.format')}}</th>
                            </thead>
                            <tbody>
                                <tr v-for="value of method.returns">
                                    <AtomsPropLine :third="value.format">
                                        <template #name>
                                            {{ value.key }}
                                        </template>
                                        <template #value>
                                            {{ value.type }}
                                        </template>
                                    </AtomsPropLine>
                                </tr>
                            </tbody>
                        </table>
                        
                        <h4 class="uk-margin-small-left uk-margin-remove-vertical" v-if="method.recieves.length > 0">
                            {{ $t('general.called') }}
                        </h4>
                        <table class="uk-table uk-table-middle uk-table-divider uk-margin-remove-top" v-if="method.recieves.length > 0">
                            <thead v-if="!isMobile()">
                                <th class="uk-width-1-5">{{ $t('ton.name')}}</th>
                                <th class="uk-width-4-5">{{ $t('general.value')}}</th>
                            </thead>
                            <tbody>
                                <tr v-for="value of method.recieves">
                                    <AtomsPropLine>
                                        <template #name>
                                            {{ value.key }}
                                        </template>
                                        <template #value>
                                            <AtomsCopyableText :text="value.value.toString()">
                                                <p v-if="!(value.addr && value.value !== 'NONE') && !value.content" class="uk-text-truncate uk-margin-remove"  :style="isMobile() ? 'max-width: 90vw' : 'max-width: calc(100vw * 0.75 * 0.65)'">
                                                    {{ value.value ? value.value : $t('general.empty') }}
                                                </p>
                                                <NuxtLink v-else-if="value.content" rel="external" aria-label="nft_link" :to="value.value" class="uk-text-primary uk-text-truncate uk-margin-remove"  :style="isMobile() ? 'max-width: 90vw' : 'max-width: calc(100vw * 0.75 * 0.7)'">
                                                    {{ value.value }}
                                                </NuxtLink>
                                                <NuxtLink v-else-if="value.addr" class="uk-text-primary" :to="`/accounts?hex=${value.value}`" :style="isMobile() ? 'max-width: 90vw' : 'max-width: calc(100vw * 0.75 * 0.7)'"> 
                                                    {{ value.value }}
                                                </NuxtLink>
                                            </AtomsCopyableText>
                                        </template>
                                    </AtomsPropLine>
                                </tr>
                            </tbody>
                        </table>

                        <h4 class="uk-margin-small-left uk-margin-remove-vertical" v-if="method.returns.length > 0">
                            {{ $t('general.returns') }}
                        </h4>
                        <table class="uk-table uk-table-middle uk-table-divider uk-margin-remove-top" v-if="method.returns.length > 0 && !method.error">
                            <thead v-if="!isMobile()">
                                <th class="uk-width-1-5">{{ $t('ton.name')}}</th>
                                <th class="uk-width-4-5">{{ $t('general.value')}}</th>
                            </thead>
                            <tbody>
                                <tr v-for="value of method.returns">
                                    <AtomsPropLine>
                                        <template #name>
                                            {{ value.key }}
                                        </template>
                                        <template #value>
                                            <AtomsCopyableText :text="value.value ? value.value.toString() : ''">
                                                <p v-if="!(value.addr && value.value !== 'NONE') && !value.content" class="uk-text-truncate uk-margin-remove"  :style="isMobile() ? 'max-width: 90vw' : 'max-width: calc(100vw * 0.75 * 0.65)'">
                                                    {{ value.value ? value.value : $t('general.empty') }}
                                                </p>
                                                <NuxtLink v-else-if="value.content" rel="external" aria-label="nft_link" :to="value.value" class="uk-text-primary uk-text-truncate uk-margin-remove"  :style="isMobile() ? 'max-width: 90vw' : 'max-width: calc(100vw * 0.75 * 0.7)'">
                                                    {{ value.value }}
                                                </NuxtLink>
                                                <NuxtLink v-else-if="value.addr" class="uk-text-primary" :to="`/accounts?hex=${value.value}`" :style="isMobile() ? 'max-width: 90vw' : 'max-width: calc(100vw * 0.75 * 0.7)'"> 
                                                    {{ value.value }}
                                                </NuxtLink>
                                            </AtomsCopyableText>
                                        </template>
                                    </AtomsPropLine>
                                </tr>
                            </tbody>
                        </table>

                        <div class="uk-margin-small uk-margin-small-left uk-text-danger" v-if="method.error">
                            {{ method.error }}
                        </div>
                    </div>
                </li>
            </ul>
        </template>
    </div>
</template>
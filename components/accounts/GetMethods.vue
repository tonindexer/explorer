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
            for (const [index, arg] of method.return_values?.entries()) {
                const value = (!method.error && (method.returns[index] || method.returns[index] === 0)) ? method.returns[index] : ''
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
            <h4 class="uk-flex uk-margin-remove-vertical">
                <NuxtLink :to="`/accounts?contract=${section.title}`" class="uk-text-bold uk-text-primary" uk-icon="icon:link" style="line-height: 1.5;">
                    {{ section.title }}
                </NuxtLink>
            </h4>
            <ul uk-accordion="multiple: true">
                <li class="uk-padding-small uk-border-rounded uk-background-muted" v-for="method of section.methods" >
                    <a class="uk-accordion-title uk-text-truncate uk-text-primary" href="#">
                        {{ method.name }}
                    </a>
                    <div class="uk-accordion-content">
                        
                        <h4 class="uk-margin-small-left uk-margin-remove-vertical uk-text-primary" v-if="method.recieves.length > 0">
                            {{ $t('general.called') }}
                        </h4>
                        <table class="uk-table uk-table-middle uk-table-divider uk-margin-remove-top" v-if="method.recieves.length > 0">
                            <thead v-if="!isMobile()">
                                <th class="uk-table-shrink">{{ $t('ton.name')}}</th>
                                <th class="uk-width-1-6">{{ $t('general.type')}}</th>
                                <th class="uk-width-1-6">{{ $t('general.format')}}</th>
                                <th class="uk-table-expand">{{ $t('general.value')}}</th>
                            </thead>
                            <tbody>
                                <tr v-for="value of method.recieves">
                                    <AtomsPropLine :third="value.type" :fourth="value.format">
                                        <template #name>
                                            {{ value.key }}
                                        </template>
                                        <template #value>
                                            <AtomsCopyableText :text="(value.value ?? '').toString()" :custom-desk-width="'35vw'" :custom-mobile-width="'80vw'">
                                                <p v-if="!(value.addr && value.value !== 'NONE') && !value.content" class="uk-text-truncate uk-margin-remove">
                                                    {{ value.value ?? $t('general.empty') }}
                                                </p>
                                                <NuxtLink v-else-if="value.content" rel="external" aria-label="nft_link" :to="value.value" class="uk-text-primary uk-text-truncate uk-margin-remove">
                                                    {{ value.value }}
                                                </NuxtLink>
                                                <NuxtLink v-else-if="value.addr" class="uk-text-primary" :to="{name: 'accounts-hex', params: {hex: value.value}, hash: '#overview'}"> 
                                                    {{ value.value }}
                                                </NuxtLink>
                                            </AtomsCopyableText>
                                        </template>
                                    </AtomsPropLine>
                                </tr>
                            </tbody>
                        </table>

                        <h4 class="uk-margin-small-left uk-margin-remove-vertical uk-text-primary" v-if="method.returns.length > 0">
                            {{ $t('general.returns') }}
                        </h4>
                        <table class="uk-table uk-table-middle uk-table-divider uk-margin-remove-top" v-if="method.returns.length > 0 && !method.error">
                            <thead v-if="!isMobile()">
                                <th class="uk-width-1-4">{{ $t('ton.name')}}</th>
                                <th class="uk-width-1-6">{{ $t('general.type')}}</th>
                                <th class="uk-width-1-6">{{ $t('general.format')}}</th>
                                <th class="uk-table-expand">{{ $t('general.value')}}</th>
                            </thead>
                            <tbody>
                                <tr v-for="value of method.returns">
                                    <AtomsPropLine :third="value.type" :fourth="value.format">
                                        <template #name>
                                            {{ value.key }}
                                        </template>
                                        <template #value>
                                            <AtomsCopyableText :text="(value.value ?? '').toString()" :custom-desk-width="'35vw'" :custom-mobile-width="'80vw'">
                                                <p v-if="!(value.addr && value.value !== 'NONE') && !value.content" class="uk-text-truncate uk-margin-remove">
                                                    {{ value.value ?? $t('general.empty') }}
                                                </p>
                                                <NuxtLink v-else-if="value.content" rel="external" aria-label="nft_link" :to="value.value" class="uk-text-primary uk-text-truncate uk-margin-remove">
                                                    {{ value.value }}
                                                </NuxtLink>
                                                <NuxtLink v-else-if="value.addr" class="uk-text-primary" :to="{name: 'accounts-hex', params: {hex: value.value}, hash: '#overview'}"> 
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
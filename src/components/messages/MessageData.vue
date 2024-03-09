<script setup lang="ts">

const props = defineProps<{
    method: MockType
}>()

interface FirstLevel {
    title: string
    value: string | SecondLevel[]
    addr: boolean
    object: boolean
}

interface SecondLevel {
    title: string
    value: any
    addr: boolean
}

const parseData = computed((): FirstLevel[] => {
    const output: FirstLevel[] = []
    for (const key in props.method) {
        const section: FirstLevel = {
            title: key,
            value: "",
            addr: false,
            object: false
        }
        const value = props.method[key]
        if (typeof value === 'object') {
            const arr: SecondLevel[] = []
            for (const key2 in value) {
                const second: SecondLevel = {
                    title: key2,
                    addr: addParse(value[key2]) ? true : false,
                    value: value[key2]
                }
                arr.push(second)
            }
            section.value = arr
            section.object = true
        } else {
            section.value = value
            if (addParse(value)) section.addr = true
        }
        output.push(section)
    }
    return output
})

</script>

<template>
    <table class="uk-table uk-table-middle uk-table-divider uk-margin-remove-top">
        <thead v-if="!isMobile()">
            <tr>
                <th class="uk-width-1-5" style="max-width: 20%;">{{ $t('general.field')}}</th>
                <th class="uk-table-expand" style="margin-right: 0.3rem;">{{ $t('general.value')}}</th>
            </tr>
        </thead>
        <tbody v-if="!isMobile()">
            <template v-for="section of parseData">
                <tr v-if="!(section.object && typeof section.value === 'object')">
                    <td class="uk-width-1-5">
                        <div class="uk-margin-remove">
                            {{ section.title }}
                        </div>
                    </td>
                    <td class="uk-flex uk-width-1-1 uk-flex-middle" style="max-width: calc(100vw * 0.75 * 0.75)">
                        <AtomsCopyableText v-if="!(section.addr && section.value !== 'NONE')"  :text="section.value.toString()">
                            {{ section.value ? section.value : $t('general.empty') }}
                        </AtomsCopyableText>
                        <NuxtLink v-else-if="section.addr" class="uk-text-primary uk-text-truncate" :to="{name: 'accounts-hex', params: {hex: section.value.toString()}, hash: '#overview'}" style="max-width: calc(100vw * 0.75 * 0.7)"> 
                            {{ section.value }}
                        </NuxtLink>
                    </td>
                </tr>
                <template v-else v-for="second of section.value">
                    <tr>
                        <td class="uk-width-1-5">
                            <div class="uk-text-small uk-text-bold">
                                {{ section.title }}
                            </div>
                            <div class="uk-margin-remove">
                                {{ second.title }}
                            </div>
                        </td>
                        <td class="uk-flex uk-flex-middle">
                            <AtomsCopyableText v-if="!(second.addr && second.value !== 'NONE')"  :text="second.value.toString()">
                                {{ second.value ? second.value : $t('general.empty') }}
                            </AtomsCopyableText>
                            <NuxtLink v-else-if="second.addr" class="uk-text-primary uk-text-truncate" :to="{name: 'accounts-hex', params: {hex: section.value.toString()}, hash: '#overview'}" style="max-width: calc(100vw * 0.75 * 0.7)"> 
                                {{ second.value }}
                            </NuxtLink>
                        </td>
                    </tr>
                </template>
            </template>
        </tbody>
        <tbody v-else>
            <template v-for="section of parseData">
                <tr v-if="!(section.object && typeof section.value === 'object')">
                    <AtomsPropLine>
                        <template #name>
                            {{ section.title }}
                        </template>
                        <template #value>
                            <AtomsCopyableText v-if="!(section.addr && section.value !== 'NONE')"  :text="section.value.toString()">
                            {{ section.value ? section.value : $t('general.empty') }}
                            </AtomsCopyableText>
                            <NuxtLink v-else-if="section.addr" class="uk-text-primary uk-text-truncate" :to="{name: 'accounts-hex', params: {hex: section.value.toString()}, hash: '#overview'}" style="max-width: calc(100vw * 0.9)"> 
                                {{ section.value }}
                            </NuxtLink>
                        </template>
                    </AtomsPropLine>
                </tr>
                <tr v-else v-for="second of section.value">
                    <AtomsPropLine>
                        <template #name>
                            {{ section.title + ' -> ' + second.title}}
                        </template>
                        <template #value>
                            <AtomsCopyableText v-if="!(second.addr && second.value !== 'NONE')"  :text="second.value.toString()">
                                {{ second.value ? second.value : $t('general.empty') }}
                            </AtomsCopyableText>
                            <NuxtLink v-else-if="second.addr" class="uk-text-primary uk-text-truncate" :to="{name: 'accounts-hex', params: {hex: section.value.toString()}, hash: '#overview'}" style="max-width: calc(100vw * 0.9)"> 
                                {{ second.value }}
                            </NuxtLink>
                        </template>
                    </AtomsPropLine>
                </tr>
            </template>
        </tbody>
    </table>
</template>
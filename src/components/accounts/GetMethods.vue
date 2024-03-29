<script setup lang="ts">

const props = defineProps<{
    methods: {[key: string] : GetMethod[]}
}>()

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
    [key: string] : {
        [key: string]: Method
    }
}

const parseData = computed((): TableSection => {
    const output: TableSection = {}
    for (const key in props.methods) {
        output[key] = {}
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
            if (method.return_values && method.return_values.entries())
                for (const [index, arg] of method.return_values.entries()) {
                    const value = (!method.error && (method.returns[index] || method.returns[index] === 0)) ? method.returns[index] : ''
                    methodOut.returns.push({
                        key: arg.name,
                        value: value,
                        type: arg.stack_type,
                        format: arg.format ? arg.format.toString(): '',
                        addr: arg.format && (arg.format === "addr") ? true : false,
                        content: arg.format && (arg.format === "content" && !(typeof value === 'object')) ? true : false,
                    })
                }
            output[key][method.name] = methodOut
        }
    }
    return output
})

const allMethods = computed(() => {
    const output = {} as { [key: string]: string[] }
    Object.keys(parseData.value).forEach((section: string) => {
        output[section] = []
        Object.keys(parseData.value[section]).forEach(method => output[section].push(method))
    })
    return output
})

const method = ref<string>('')
const methodPair = ref({ parent: '', child: '' })
const shownMethod = computed(() => {
    return parseData.value?.[methodPair.value.parent]?.[methodPair.value.child] ?? null
})
onBeforeMount(() => {
    method.value = Object.values(allMethods.value)[0][0]
    methodPair.value = { parent: Object.keys(allMethods.value)[0], child: method.value }
})
</script>

<template>
  <div
    class="uk-padding-bottom" 
    :class="{ 'uk-margin-remove': isMobile() }"
    uk-grid
  >
    <div 
      class="uk-width-1-1 uk-width-1-5@m uk-margin-small uk-margin-small-right" 
      :class="{ 'uk-padding-remove': isMobile() }"
      style="min-width: 250px; padding-left: 46px ;width: fit-content;"
    >
      <AtomsRadioButtons 
        v-model:selected="method" 
        v-model:selected-layer="methodPair" 
        :options-layers="allMethods" 
        :layered="true"
      />
    </div>
    <div 
      class="uk-width-1-1 uk-width-expand@m uk-margin-remove-top uk-padding-remove"
      :class="{ 'divider': !isMobile()}"
    >
      <template v-if="!shownMethod">
        {{ $t('warning.pick_method') }}
      </template>
      <template v-else>
        <h4 
          v-if="shownMethod.recieves.length > 0"
          class="uk-margin-remove-vertical uk-text-primary"
          :class="`uk-margin-${isMobile()? 'small': 'large'}-left`"
        >
          {{ $t('general.called') }}
        </h4>
        <table 
          v-if="shownMethod.recieves.length > 0"
          class="uk-table uk-table-middle uk-table-striped-inverse uk-margin-remove-top"
        >
          <colgroup v-if="!isMobile()">
            <col width="30%">
            <col width="15%">
            <col width="15%">
            <col width="40%">
          </colgroup>
          <thead
            v-if="!isMobile()"
            class="uk-margin-left"
          >
            <th class="uk-padding-large-left">
              {{ $t('ton.name') }}
            </th>
            <th>{{ $t('general.type') }}</th>
            <th>{{ $t('general.format') }}</th>
            <th>{{ $t('general.value') }}</th>
          </thead>
          <tbody>
            <tr 
              v-for="value of shownMethod.recieves"
              :key="value.key + value.type"
            >
              <AccountsGetMethodsLine
                :name="value.key"
                :third="value.type"
                :fourth="value.format"
              >
                <template #value>
                  <AtomsCopyableText
                    :text="(value.value ?? '').toString()"
                    :custom-desk-width="'100%'"
                    :custom-mobile-width="'85vw'"
                  >
                    <p
                      v-if="!(value.addr && value.value !== 'NONE') && !value.content"
                      class="uk-text-truncate uk-margin-remove"
                    >
                      {{ value.value ?? $t('general.empty') }}
                    </p>
                    <NuxtLink
                      v-else-if="value.content"
                      rel="external"
                      aria-label="nft_link"
                      :to="value.value"
                      class="uk-text-primary uk-text-truncate uk-margin-remove"
                    >
                      {{ value.value }}
                    </NuxtLink>
                    <NuxtLink
                      v-else-if="value.addr"
                      class="uk-text-primary"
                      :to="{name: 'accounts-hex', params: {hex: value.value}, hash: '#overview'}"
                    > 
                      {{ value.value }}
                    </NuxtLink>
                  </AtomsCopyableText>
                </template>
              </AccountsGetMethodsLine>
            </tr>
          </tbody>
        </table>

        <h4 
          v-if="shownMethod.returns.length > 0"
          class="uk-margin-remove-vertical uk-text-primary"
          :class="`uk-margin-${isMobile()? 'small': 'large'}-left`"
        >
          {{ $t('general.returns') }}
        </h4>
        <table 
          v-if="shownMethod.returns.length > 0 && !shownMethod.error"
          class="uk-table uk-table-middle uk-table-striped-inverse uk-margin-remove-top"
        >
          <colgroup v-if="!isMobile()">
            <col width="30%">
            <col width="15%">
            <col width="15%">
            <col width="40%">
          </colgroup>
          <thead v-if="!isMobile()">
            <th class="uk-padding-large-left">
              {{ $t('ton.name') }}
            </th>
            <th>{{ $t('general.type') }}</th>
            <th>{{ $t('general.format') }}</th>
            <th>{{ $t('general.value') }}</th>
          </thead>
          <tbody>
            <tr
              v-for="value of shownMethod.returns"
              :key="value.key + value.value"
              style="position: relative;"
            >
              <AccountsGetMethodsLine
                :name="value.key"
                :third="value.type"
                :fourth="value.format"
              >
                <template #value>
                  <pre
                    v-if="typeof value.value === 'object'"
                    class="pre-wrapper"
                  >{{ JSON.stringify(value.value, null, 4) }}</pre>
                  <AtomsCopyableText
                    v-else
                    :text="(value.value ?? '').toString()"
                    :custom-desk-width="'100%'"
                    :custom-mobile-width="'85vw'"
                  >
                    <p
                      v-if="!(value.addr && value.value !== 'NONE') && !value.content"
                      class="uk-text-truncate uk-margin-remove"
                    >
                      {{ value.value ?? $t('general.empty') }}
                    </p>
                    <NuxtLink
                      v-else-if="value.content"
                      rel="external"
                      aria-label="nft_link"
                      :to="value.value"
                      class="uk-text-primary uk-text-truncate uk-margin-remove"
                    >
                      {{ value.value }}
                    </NuxtLink>
                    <NuxtLink
                      v-else-if="value.addr"
                      class="uk-text-primary"
                      :to="{name: 'accounts-hex', params: {hex: value.value}, hash: '#overview'}"
                    > 
                      {{ value.value }}
                    </NuxtLink>
                  </AtomsCopyableText>
                </template>
              </AccountsGetMethodsLine>
            </tr>
          </tbody>
        </table>

        <div
          v-if="shownMethod.error"
          class="uk-margin-small uk-margin-small-left uk-text-danger"
        >
          {{ shownMethod.error }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.divider {
    border-left: 1px solid var(--color-bg-shadow);
}
.pre-wrapper {
    color: var(--color-text-emphasis);
    padding: 0;
    border: none;
    background: transparent;
    margin-bottom: 0;
}
</style>
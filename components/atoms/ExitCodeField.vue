<script setup lang="ts">
interface Props {
    code: number
}

defineProps<Props>()

const codeMap : { [key: number | string]: string} = {
    0: 'Success',
    1: 'Success',
    2: 'Stack underflow',
    3: 'Stack overflow',
    4: 'Integer overflow',
    5: 'Int out of expected range.',
    6: 'Invalid opcode',
    7: 'Type check error',
    8: 'Cell overflow',
    9: 'Cell underflow',
    10: 'Dictionary error',
    11: 'Unknown error',
    12: 'Impossible situation',
    13: 'Out of gas error',
    32: 'Action list is invalid / Method ID not found',
    34: 'Action is invalid or not supported',
    37: 'Not enough TON',
    38: 'Not enough extra-currencies',
    '-14': 'Out of gas error'
}
</script>

<template>
    <p class="uk-margin-remove-vertical" :uk-tooltip="`${code in codeMap ? codeMap[code] : 'Unknown error'}`">
        {{ (code === 0 || code === 1 ? '✅' : '❌')+ ' ' + code }}
    </p>
</template>
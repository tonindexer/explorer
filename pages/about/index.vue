<template>
    <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px'" :body-style="'padding: 0 16px 16px 16px'">
        <template #top>
            <h1 class="uk-margin-remove-vertical uk-text-primary">Anton</h1>
        </template>
        <template #body>
            <p class="uk-text-muted uk-margin-remove-bottom">Written in Go, Anton is an open source <a href="https://ton.org">The Open Network</a> blockchain indexer available under the <a href="https://github.com/tonindexer/anton/blob/master/LICENSE">Apache Licence 2.0</a>.
            Anton is designed to provide a scalable and flexible solution for developers to access and analyze blockchain data.</p>
        </template>
    </AtomsTile>

    <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px'" :body-style="'padding: 0 16px 16px 16px'">
        <template #top>
            <h1 id="overview" class="uk-margin-remove-vertical uk-text-primary">Overview</h1>
        </template>
        <template #body>
            <p class="uk-text-muted">Our project is building an indexer for the TON blockchain that gathers and analyzes data from contracts and tokens, providing insights into the network&#39;s activity. 
            Our goal is to help developers and users understand how the blockchain is being used, as well as make it possible for developers to add their own contracts with their own message schemas to our explorer.</p>
            <p class="uk-text-muted">If you want to hack it, go to <a href="https://github.com/tonindexer/anton">GitHub</a>.</p>
            <p class="uk-text-muted">If you want to use it, go to <a href="https://anton.tools/api/v0/swagger">Swagger API documentation</a> and <a href="https://github.com/tonindexer/anton/blob/main/docs/API.md">API query examples</a>.</p>
            <p class="uk-text-muted uk-margin-remove-bottom">If you want to look at the data, go to <a href="https://superset.anton.tools">Apache Superset</a>.</p>
        </template>
    </AtomsTile>

    <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px'" :body-style="'padding: 0 16px 16px 16px'">
        <template #top>
            <h1 id="how-does-it-work-" class="uk-margin-remove-vertical uk-text-primary">How does it work?</h1>
        </template>
        <template #body>
            <p class="uk-text-muted">Before you start, take a look at the <a href="https://ton.org/docs/learn/overviews/ton-blockchain">official docs</a>.</p>
            <p class="uk-text-muted">Consider an arbitrary contract.
            It has a state that is updated with any transaction on the contract&#39;s account.
            Each state has the contract code and data.
            The contract data can be complex, but developers typically provide <a href="https://ton.org/docs/develop/func/functions#specifiers">get-methods</a> in the contract, which can be executed to retrieve the necessary data.
            The TON has standard contracts (such as <a href="https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md">TEP-62</a>, <a href="https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md">TEP-74</a>), and they have predefined get-method names.
            Therefore, you can attempt to match accounts found in the network to these standards by checking the presence of the get-methods.
            Contract standards also specify <a href="https://ton.org/docs/learn/overviews/tl-b-language#constructors">TL-B constructor tags</a> (or operation ids) for each acceptable message to contract, defined as the first 32 bits of the parsed message payload cell.
            So you if you know standard of a given contract, you can determine the type of message to it (for example, NFT item transfer) by parsing the first 32 bits of message body.</p>
            <p class="uk-text-muted">Anton allows you to define the contract interface in just one JSON schema.
            Format of every schema is described in detail in <a href="https://github.com/tonindexer/anton/blob/main/abi/README.md">abi/README.md</a>.
            Every schema comprises contract get-methods, as well as incoming and outgoing message schemas for the contract.
            Once contract interfaces are defined and stored in the database, Anton begins scanning new blocks on the network.
            The tool stores every account state, transaction, and message in the database.
            For get-methods without arguments in the contract interface, Anton emulates these methods and saves the returned values to the database.
            When a message is sent to a known contract interface, Anton attempts to match the message to a known schema by comparing the parsed operation ID.
            If the message is successfully parsed using the identified schema, Anton also stores the parsed data.</p>
            <p class="uk-text-muted uk-margin-remove-bottom">To explore contract interfaces known to this project, visit the <a href="https://github.com/tonindexer/anton/tree/main/abi/known">abi/known</a> directory.
            This will provide you with an understanding of the various contract interfaces already supported and serve as examples for adding your own.</p>
        </template>
    </AtomsTile>

</template>

<style lang="scss" scoped>
a {
    color: black
}
</style>
[**dynamic-6551 v1.0.0**](../README.md) • **Docs**

***

[dynamic-6551 v1.0.0](../globals.md) / useAccountHoldings

# Function: useAccountHoldings()

> **useAccountHoldings**(): `object`

## Returns

`object`

### error

> **error**: `null` \| `string`

### getAccountHoldings()

> **getAccountHoldings**: (`walletAddress`) => `Promise`\<`object`\>

#### Parameters

• **walletAddress**: \`0x$\{string\}\`

#### Returns

`Promise`\<`object`\>

##### nfts

> **nfts**: `NFTWithTokenboundAccount`[]

##### tokens

> **tokens**: `GetTokensForOwnerResponse`

### loading

> **loading**: `boolean`

## Defined in

[hooks/tokenbound/useAccountHoldings.tsx:38](https://github.com/toinfinfty/dynamic-6551/blob/83cd84a6cc05b02ea171e77c40326808316432e3/src/hooks/tokenbound/useAccountHoldings.tsx#L38)

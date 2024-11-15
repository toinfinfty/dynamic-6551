
# Areta Grant React Library

The Areta Grant React Library provides a set of hooks and providers to interact with token-bound accounts, NFTs, and ERC-20 tokens in a React application. This library is built using React, TypeScript, and Vite, with an emphasis on handling token transfers and management within the Ethereum ecosystem.

## Table of Contents

1. [Installation](#installation)
2. [Setup and Usage](#setup-and-usage)
3. [Available Providers](#available-providers)
4. [Available Hooks](#available-hooks)
5. [API Documentation](#api-documentation)
6. [Debugging](#debugging)
7. [Example Usage in a Project](#example-usage-in-a-project)
8. [License](#license)

## Installation

To install the library, use npm or yarn:

```bash
npm install areta-grant-react-library
# or
yarn add areta-grant-react-library
```

You’ll also need to install peer dependencies if they’re not included in your project:

- **@rainbow-me/rainbowkit** for wallet styling
- **wagmi** and **ethers** for Ethereum interaction

## Setup and Usage

1. **Import the ConfigProvider:**:

  To use the library effectively, wrap your application with the ConfigProvider component. This provider configures wallet connections, token-bound account management, and provides necessary configurations like the Alchemy client.

2. **Wrap Your App**:

   In your main app layout or root component, wrap your application with the ConfigProvider:

   ```tsx
  import React from "react";
  import { ConfigProvider } from "areta-grant-react-library";
  import "@rainbow-me/rainbowkit/styles.css"; // Import RainbowKit styles for wallet connector
  import { Alchemy, Network } from "alchemy-sdk";

  // Initialize the Alchemy client
  const alchemyClient = new Alchemy({
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY || "YourDefaultAPIKey",
    network:
      process.env.REACT_APP_BLOCKCHAIN_NETWORK === "mainnet"
        ? Network.ARB_MAINNET
        : Network.ARB_SEPOLIA,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  });

  function App() {
    return (
      <ConfigProvider alchemyClient={alchemyClient}>
        <YourAppComponent />
      </ConfigProvider>
    );
  }

  export default App;
   ```

   > **Note**: Ensure that `@rainbow-me/rainbowkit/styles.css` is imported in your root layout for styling the wallet connector.
   > **Note**: Set up the necessary environment variables in your .env file.

## Available Providers

### `ConfigProvider`

The ConfigProvider is responsible for initializing all the necessary configurations for the library to function properly. It:
	•	Sets up the Alchemy client for interacting with the blockchain.
	•	Configures wallet connections using Wagmi and RainbowKit.
	•	Initializes the Tokenbound SDK for managing token-bound accounts.

By wrapping your application with ConfigProvider, all components and hooks from the library will have access to the required context and configurations.

## Available Hooks

The library provides various hooks for interacting with tokens and token-bound accounts. Here are the key hooks:

### 1. **useTokenboundTransfer**

   - **Description**: This hook provides methods to transfer assets from a token-bound account.
   - **Usage**:
     ```tsx
     import { useTokenboundTransfer } from "areta-grant-react-library";

     const { transferNft, transferERC20, loading, error } = useTokenboundTransfer();

     // Usage example
     const handleTransfer = async () => {
       await transferNft({
         account: "0xYourAccountAddress",
         tokenContract: "0xTokenContractAddress",
         tokenId: "1",
         tokenType: "ERC721",
         recipientAddress: "0xRecipientAddress",
       });
     };
     ```

### 2. **useTransferERC20**

   - **Description**: Provides a method for transferring ERC-20 tokens to any Ethereum address, including token-bound accounts.
   - **Usage**:
     ```tsx
     import { useTransferERC20 } from "areta-grant-react-library";

     const { transferERC20, loading, error } = useTransferERC20();

     const handleERC20Transfer = async () => {
       await transferERC20({
         contractAddress: "0xERC20ContractAddress",
         toAddress: "0xRecipientAddress",
         amount: 1000,
       });
     };
     ```

### 3. **useTransferNft**

   - **Description**: This hook provides a method for transferring ERC-721 NFTs to any Ethereum address.
   - **Usage**:
     ```tsx
     import { useTransferNft } from "areta-grant-react-library";

     const { transferNft, loading, error } = useTransferNft();

     const handleNftTransfer = async () => {
       await transferNft({
         contractAddress: "0xNFTContractAddress",
         fromAddress: "0xSenderAddress",
         toAddress: "0xRecipientAddress",
         tokenId: "1",
       });
     };
     ```

### 4. **useAccountHoldings**

   - **Description**: Retrieves the NFTs and ERC-20 tokens held by a specific account including nested tokenbound accounts.
   - **Usage**:
     ```tsx
     import { useAccountHoldings } from "areta-grant-react-library";

     const { getAccountHoldings, loading, error } = useAccountHoldings();

     useEffect(() => {
       getAccountHoldings("0xYourWalletAddress");
     }, []);
     ```

### 5. **useCreateTokenboundAccount**

   - **Description**: Provides a method to create a token-bound account.
   - **Usage**:
     ```tsx
     import { useCreateTokenboundAccount } from "areta-grant-react-library";

     const { createTokenboundAccount, loading, error } = useCreateTokenboundAccount();

     const handleCreateAccount = async () => {
       await createTokenboundAccount("0xTokenContractAddress", "1");
     };
     ```

## API Documentation

### Providers

1. **WagmiConfigProvider**: Initializes and configures the Wagmi client, providing wallet connectivity and RainbowKit functionality.
2. **TokenboundProvider**: Sets up the Tokenbound SDK and provides functionality to interact with token-bound accounts.

### Hooks

- **useTokenboundTransfer**: Manages the transfer of NFTs and ERC-20 tokens out of a token-bound account.
- **useTransferERC20**: Transfers ERC-20 tokens to any address, including token-bound accounts.
- **useTransferNft**: Transfers ERC-721 NFTs to any address, including token-bound accounts.
- **useAccountHoldings**: Fetches NFTs and ERC-20 token balances for a specific Ethereum account.
- **useCreateTokenboundAccount**: Creates a new token-bound account for managing assets.

## Debugging

This library uses the `debug` package for logging. You can enable debug logs by setting the `DEBUG` environment variable. The following debug namespaces are available:

- `myLibrary:main` - Logs general library operations
- `myLibrary:account` - Logs account-related operations
- `myLibrary:nft` - Logs NFT-related operations
- `myLibrary:tokenbound` - Logs token-bound account operations

To enable all logs, you can set `DEBUG=myLibrary:*`:

```bash
DEBUG=myLibrary:* node yourApp.js
```

Or, to enable specific logs, use the relevant namespace:

```bash
DEBUG=myLibrary:account node yourApp.js
```

## Example Usage in a Project

1. **Install the library**:
   ```bash
   npm install areta-grant-react-library
   ```

2. **Wrap your application with the required providers**:

   ```tsx
   import React from "react";
   import { WagmiConfigProvider, TokenboundProvider } from "areta-grant-react-library";
   import "@rainbow-me/rainbowkit/styles.css";

   function App() {
     return (
       <WagmiConfigProvider>
         <TokenboundProvider>
           <YourAppComponent />
         </TokenboundProvider>
       </WagmiConfigProvider>
     );
   }

   export default App;
   ```

3. **Use hooks within components**:

   ```tsx
   import React from "react";
   import { useTransferNft } from "areta-grant-react-library";

   const TransferComponent = () => {
     const { transferNft, loading, error } = useTransferNft();

     const handleTransfer = async () => {
       try {
         await transferNft({
           contractAddress: "0xNFTContractAddress",
           fromAddress: "0xYourAddress",
           toAddress: "0xRecipientAddress",
           tokenId: "1",
         });
         console.log("Transfer successful!");
       } catch (error) {
         console.error("Transfer failed", error);
       }
     };

     return (
       <button onClick={handleTransfer} disabled={loading}>
         {loading ? "Transferring..." : "Transfer NFT"}
       </button>
     );
   };
   ```

## License

This project is licensed under the MIT License.

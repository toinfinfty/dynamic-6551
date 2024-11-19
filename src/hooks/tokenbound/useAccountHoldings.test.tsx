import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccountHoldings } from './useAccountHoldings';
import { useTokenbound } from '../useTokenbound';
// import { alchemyClient } from '../../utils/alchemyClient';
import { getNetworkConfig } from '../../utils/networkConfig';
import { Address } from 'viem';

// Mock useTokenbound hook
vi.mock('../useTokenbound', () => ({
    useTokenbound: vi.fn(),
}));

// Mock alchemyClient
/*
vi.mock('../../utils/alchemyClient', () => ({
    alchemyClient: {
        nft: {
            getNftsForOwner: vi.fn(),
        },
        core: {
            getTokensForOwner: vi.fn(),
        },
    },
}));*/

// Mock getNetworkConfig
vi.mock('../../utils/networkConfig', () => ({
    getNetworkConfig: vi.fn(),
}));

const mockTokenboundClient = {
    getAccount: vi.fn(),
    checkAccountDeployment: vi.fn(),
};

describe('useAccountHoldings', () => {
    const walletAddress: Address = '0x1234567890123456789012345678901234567890';
    const tokenboundAddress: Address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef';

    const mockTokensResponse = {
        tokens: [
            {
                contractAddress: tokenboundAddress,
                balance: '100',
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        (useTokenbound as Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });
        (getNetworkConfig as Mock).mockReturnValue({ id: 1 });

        // Mock getNftsForOwner to return different results based on the address
        /*
        (alchemyClient.nft.getNftsForOwner as Mock).mockImplementation((address) => {
            if (address === walletAddress) {
                return Promise.resolve({
                    ownedNfts: [
                        {
                            contract: { address: tokenboundAddress },
                            tokenId: '1',
                        },
                    ],
                });
            }
            // For tokenbound address, return empty array
            return Promise.resolve({ ownedNfts: [] });
        });*/

        // Mock getTokensForOwner to return the wrapped tokens response
        // (alchemyClient.core.getTokensForOwner as Mock).mockResolvedValue(mockTokensResponse);

        // Mock tokenbound client methods
        mockTokenboundClient.getAccount.mockResolvedValue(tokenboundAddress);
        mockTokenboundClient.checkAccountDeployment.mockResolvedValue(true);
    });

    it('should fetch account holdings successfully', async () => {
        const { result } = renderHook(() => useAccountHoldings());

        await act(async () => {
            const holdings = await result.current.getAccountHoldings(walletAddress);
            expect(holdings).toEqual({
                nfts: [
                    {
                        contract: { address: tokenboundAddress },
                        tokenId: '1',
                        owner: walletAddress,
                        tokenboundAccount: {
                            address: tokenboundAddress,
                            nfts: [], // Tokenbound account has no NFTs
                            tokens: mockTokensResponse.tokens,
                        },
                    },
                ],
                tokens: mockTokensResponse, // Note: keeping the wrapper object
            });
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);

        // Verify mock calls
        // expect(alchemyClient.nft.getNftsForOwner).toHaveBeenCalledWith(walletAddress);
        // expect(alchemyClient.nft.getNftsForOwner).toHaveBeenCalledWith(tokenboundAddress);
        // expect(alchemyClient.core.getTokensForOwner).toHaveBeenCalledWith(walletAddress);
    });

    it('should handle fetching failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();

        // (alchemyClient.nft.getNftsForOwner as Mock).mockRejectedValue(new Error('Fetching failed'));

        const { result } = renderHook(() => useAccountHoldings());

        await act(async () => {
            await expect(result.current.getAccountHoldings(walletAddress)).rejects.toThrow('Fetching failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to fetch NFTs');
        // Restore console.error
        console.error = originalConsoleError;
    });
});

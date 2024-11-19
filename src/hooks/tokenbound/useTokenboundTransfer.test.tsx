import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTokenboundTransfer } from './useTokenboundTransfer';
import { useTokenbound } from '../useTokenbound';
import { Address } from 'viem';

// Mock useTokenbound hook
vi.mock('../useTokenbound', () => ({
    useTokenbound: vi.fn(),
}));

const mockTokenboundClient = {
    isValidSigner: vi.fn(),
    transferNFT: vi.fn(),
    transferERC20: vi.fn(),
};

describe('useTokenboundTransfer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should transfer NFT successfully', async () => {
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });

        const { result } = renderHook(() => useTokenboundTransfer());

        const params = {
            account: '0x1234567890123456789012345678901234567890' as Address,
            tokenContract: '0x1234567890123456789012345678901234567890' as Address,
            tokenId: '1',
            tokenType: 'ERC721',
            recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
        };

        mockTokenboundClient.isValidSigner.mockResolvedValue(true);
        mockTokenboundClient.transferNFT.mockResolvedValue({});

        await act(async () => {
            await result.current.transferNft(params);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should transfer ERC20 successfully', async () => {
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });

        const { result } = renderHook(() => useTokenboundTransfer());

        const params = {
            account: '0x1234567890123456789012345678901234567890' as Address,
            amount: 100,
            recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            erc20tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            erc20tokenDecimals: 18,
        };

        mockTokenboundClient.isValidSigner.mockResolvedValue(true);
        mockTokenboundClient.transferERC20.mockResolvedValue({});

        await act(async () => {
            await result.current.transferERC20(params);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should throw an error when tokenboundClient is not initialized', async () => {
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: null });

        const { result } = renderHook(() => useTokenboundTransfer());

        const params = {
            account: '0x1234567890123456789012345678901234567890' as Address,
            tokenContract: '0x1234567890123456789012345678901234567890' as Address,
            tokenId: '1',
            tokenType: 'ERC721',
            recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
        };

        await act(async () => {
            await expect(result.current.transferNft(params)).rejects.toThrow('TokenboundClient not initialized');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle invalid signer error', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });

        const { result } = renderHook(() => useTokenboundTransfer());

        const params = {
            account: '0x1234567890123456789012345678901234567890' as Address,
            tokenContract: '0x1234567890123456789012345678901234567890' as Address,
            tokenId: '1',
            tokenType: 'ERC721',
            recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
        };

        mockTokenboundClient.isValidSigner.mockResolvedValue(false);

        await act(async () => {
            await expect(result.current.transferNft(params)).rejects.toThrow('Invalid signer for tokenbound account');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to transfer NFT');
        // Restore console.error
        console.error = originalConsoleError;
    });

    it('should handle NFT transfer failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });

        const { result } = renderHook(() => useTokenboundTransfer());

        const params = {
            account: '0x1234567890123456789012345678901234567890' as Address,
            tokenContract: '0x1234567890123456789012345678901234567890' as Address,
            tokenId: '1',
            tokenType: 'ERC721',
            recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
        };

        const mockError = new Error('NFT transfer failed');

        mockTokenboundClient.isValidSigner.mockResolvedValue(true);
        mockTokenboundClient.transferNFT.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.transferNft(params)).rejects.toThrow('NFT transfer failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to transfer NFT');
        // Restore console.error
        console.error = originalConsoleError;
    });

    it('should handle ERC20 transfer failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });

        const { result } = renderHook(() => useTokenboundTransfer());

        const params = {
            account: '0x1234567890123456789012345678901234567890' as Address,
            amount: 100,
            recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            erc20tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            erc20tokenDecimals: 18,
        };

        const mockError = new Error('ERC20 transfer failed');

        mockTokenboundClient.isValidSigner.mockResolvedValue(true);
        mockTokenboundClient.transferERC20.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.transferERC20(params)).rejects.toThrow('ERC20 transfer failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to transfer tokenbound ERC20');
        // Restore console.error
        console.error = originalConsoleError;
    });
});

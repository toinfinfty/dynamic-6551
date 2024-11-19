import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransferERC1155Nft } from './useTransferERC1155Nft';
import { useWalletClient } from 'wagmi';
import { Address } from 'viem';
import { ERC1155ABI } from '../../utils/ERC1155ABI';

// Mock useWalletClient hook
vi.mock('wagmi', () => ({
    useWalletClient: vi.fn(),
}));

const mockWalletClient = {
    writeContract: vi.fn(),
};

describe('useTransferERC1155Nft', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should transfer ERC1155 tokens successfully', async () => {
        (useWalletClient as Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useTransferERC1155Nft());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            tokenId: '1',
            amount: 100,
        };
        const mockTx = { hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef' };

        mockWalletClient.writeContract.mockResolvedValue(mockTx);

        await act(async () => {
            const tx = await result.current.transferERC1155Nft(params);
            expect(tx).toEqual(mockTx);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
            address: params.contractAddress,
            abi: ERC1155ABI,
            functionName: 'safeTransferFrom',
            args: [params.fromAddress, params.toAddress, params.tokenId, params.amount, '0x0'],
        });
    });

    it('should throw an error when wallet client is not connected', async () => {
        (useWalletClient as Mock).mockReturnValue({ data: null });

        const { result } = renderHook(() => useTransferERC1155Nft());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            tokenId: '1',
            amount: 100,
        };

        await act(async () => {
            await expect(result.current.transferERC1155Nft(params)).rejects.toThrow('No wallet client connected');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle transfer failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useWalletClient as Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useTransferERC1155Nft());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            tokenId: '1',
            amount: 100,
        };
        const mockError = new Error('Transfer failed');

        mockWalletClient.writeContract.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.transferERC1155Nft(params)).rejects.toThrow('Transfer failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to transfer NFT');

        // Restore console.error
        console.error = originalConsoleError;
    });
});

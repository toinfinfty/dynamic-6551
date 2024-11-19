import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransferNft } from './useTransferNft';
import { useWalletClient } from 'wagmi';
import { Address } from 'viem';
import { PARENT_ABI } from '../../utils/parentErc721ABI';

// Mock useWalletClient hook
vi.mock('wagmi', () => ({
    useWalletClient: vi.fn(),
}));

const mockWalletClient = {
    writeContract: vi.fn(),
};

describe('useTransferNft', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should transfer NFT successfully', async () => {
        (useWalletClient as Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useTransferNft());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            tokenId: '1',
        };
        const mockTx = { hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef' };

        mockWalletClient.writeContract.mockResolvedValue(mockTx);

        await act(async () => {
            const tx = await result.current.transferNft(params);
            expect(tx).toEqual(mockTx);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
            address: params.contractAddress,
            abi: PARENT_ABI,
            functionName: 'transferFrom',
            args: [params.fromAddress, params.toAddress, params.tokenId],
        });
    });

    it('should throw an error when wallet client is not connected', async () => {
        (useWalletClient as Mock).mockReturnValue({ data: null });

        const { result } = renderHook(() => useTransferNft());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            tokenId: '1',
        };

        await act(async () => {
            await expect(result.current.transferNft(params)).rejects.toThrow('No wallet client connected');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle transfer failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useWalletClient as Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useTransferNft());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            tokenId: '1',
        };
        const mockError = new Error('Transfer failed');

        mockWalletClient.writeContract.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.transferNft(params)).rejects.toThrow('Transfer failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to transfer NFT');

        // Restore console.error
        console.error = originalConsoleError;
    });
});

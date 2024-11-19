import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransferERC20 } from './useTransferERC20';
import { useWalletClient } from 'wagmi';
import { Address } from 'viem';
import { ERC20ABI } from '../../utils/ERC20ABI';

// Mock useWalletClient hook
vi.mock('wagmi', () => ({
    useWalletClient: vi.fn(),
}));

const mockWalletClient = {
    writeContract: vi.fn(),
};

describe('useTransferERC20', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should transfer ERC20 tokens successfully', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useTransferERC20());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            amount: 100,
        };
        const mockTx = { hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef' };

        mockWalletClient.writeContract.mockResolvedValue(mockTx);

        await act(async () => {
            const tx = await result.current.transferERC20(params);
            expect(tx).toEqual(mockTx);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
            address: params.contractAddress,
            abi: ERC20ABI,
            functionName: 'transfer',
            args: [params.toAddress, params.amount],
        });
    });

    it('should throw an error when wallet client is not connected', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: null });

        const { result } = renderHook(() => useTransferERC20());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            amount: 100,
        };

        await act(async () => {
            await expect(result.current.transferERC20(params)).rejects.toThrow('No wallet client connected');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle transfer failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useWalletClient as vi.Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useTransferERC20());

        const params = {
            contractAddress: '0x1234567890123456789012345678901234567890' as Address,
            toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' as Address,
            amount: 100,
        };
        const mockError = new Error('Transfer failed');

        mockWalletClient.writeContract.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.transferERC20(params)).rejects.toThrow('Transfer failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to transfer ERC20');

        // Restore console.error
        console.error = originalConsoleError;
    });
});

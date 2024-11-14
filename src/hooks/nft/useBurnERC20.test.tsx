import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBurnERC20 } from './useBurnERC20';
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

describe('useBurnERC20', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should burn ERC20 tokens successfully', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useBurnERC20());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const amount = 100;
        const mockTx = { hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef' };

        mockWalletClient.writeContract.mockResolvedValue(mockTx);

        await act(async () => {
            const tx = await result.current.burnERC20(contractAddress, amount);
            expect(tx).toEqual(mockTx);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
            address: contractAddress,
            abi: ERC20ABI,
            functionName: 'burn',
            args: [amount],
        });
    });

    it('should throw an error when wallet client is not connected', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: null });

        const { result } = renderHook(() => useBurnERC20());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const amount = 100;

        await act(async () => {
            await expect(result.current.burnERC20(contractAddress, amount)).rejects.toThrow(
                'No wallet client connected'
            );
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle burn failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useWalletClient as vi.Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useBurnERC20());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const amount = 100;
        const mockError = new Error('Burn failed');

        mockWalletClient.writeContract.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.burnERC20(contractAddress, amount)).rejects.toThrow('Burn failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to burn ERC20');
        // Restore console.error
        console.error = originalConsoleError;
    });
});

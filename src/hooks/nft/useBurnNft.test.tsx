import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBurnNft } from './useBurnNft';
import { useWalletClient } from 'wagmi';
import { Address } from 'viem';
import { ERC721ABI } from '../../utils/ERC721ABI';

// Mock useWalletClient hook
vi.mock('wagmi', () => ({
    useWalletClient: vi.fn(),
}));

const mockWalletClient = {
    writeContract: vi.fn(),
};

describe('useBurnNft', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should burn NFT successfully', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useBurnNft());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const tokenId = 1;
        const mockTx = { hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef' };

        mockWalletClient.writeContract.mockResolvedValue(mockTx);

        await act(async () => {
            const tx = await result.current.burnNft(contractAddress, tokenId);
            expect(tx).toEqual(mockTx);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
            address: contractAddress,
            abi: ERC721ABI,
            functionName: 'burn',
            args: [tokenId],
        });
    });

    it('should throw an error when wallet client is not connected', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: null });

        const { result } = renderHook(() => useBurnNft());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const tokenId = 1;

        await act(async () => {
            await expect(result.current.burnNft(contractAddress, tokenId)).rejects.toThrow(
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

        const { result } = renderHook(() => useBurnNft());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const tokenId = 1;
        const mockError = new Error('Burn failed');

        mockWalletClient.writeContract.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.burnNft(contractAddress, tokenId)).rejects.toThrow('Burn failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to burn NFT');
        // Restore console.error
        console.error = originalConsoleError;
    });
});

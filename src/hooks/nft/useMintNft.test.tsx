import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMintNft } from './useMintNft';
import { useWalletClient } from 'wagmi';
import { ERC721ABI } from '../../utils/ERC721ABI';
import { Address } from 'viem';

// Mock useWalletClient hook
vi.mock('wagmi', () => ({
    useWalletClient: vi.fn(),
}));

const mockWalletClient = {
    writeContract: vi.fn(),
};

describe('useMintNft', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should mint NFT successfully', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useMintNft());

        const contractAddress = '0x1234567890123456789012345678901234567890';
        const to: Address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef';
        const mockTx = { hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef' };

        mockWalletClient.writeContract.mockResolvedValue(mockTx);

        await act(async () => {
            const tx = await result.current.mintNft(contractAddress, to);
            expect(tx).toEqual(mockTx);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
            address: contractAddress,
            abi: ERC721ABI,
            functionName: 'safeMint',
            args: [to],
        });
    });

    it('should throw an error when wallet client is not connected', async () => {
        (useWalletClient as vi.Mock).mockReturnValue({ data: null });

        const { result } = renderHook(() => useMintNft());

        const contractAddress = '0x1234567890123456789012345678901234567890';
        const to: Address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef';

        await act(async () => {
            await expect(result.current.mintNft(contractAddress, to)).rejects.toThrow('No wallet client connected');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle mint failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useWalletClient as vi.Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useMintNft());

        const contractAddress = '0x1234567890123456789012345678901234567890';
        const to: Address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef';
        const mockError = new Error('Mint failed');

        mockWalletClient.writeContract.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.mintNft(contractAddress, to)).rejects.toThrow('Mint failed');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to mint NFT');

        // Restore console.error
        console.error = originalConsoleError;
    });
});

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMintNftERC1155 } from './useMintNftERC1155';
import { useWalletClient } from 'wagmi';
import { ERC1155ABI } from '../../utils/ERC1155ABI';
import { Address } from 'viem';

// Mock useWalletClient hook
vi.mock('wagmi', () => ({
    useWalletClient: vi.fn(),
}));

const mockWalletClient = {
    writeContract: vi.fn(),
    account: { address: '0x1234567890123456789012345678901234567890' },
};

describe('useMintNftERC1155', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should mint ERC1155 tokens successfully', async () => {
        (useWalletClient as Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useMintNftERC1155());

        const contractAddress = '0x1234567890123456789012345678901234567890';
        const tokenId = 1;
        const quantity = 10;
        const data = '0x';
        const mockTx = { hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef' };

        mockWalletClient.writeContract.mockResolvedValue(mockTx);

        await act(async () => {
            const tx = await result.current.mintNftERC1155(contractAddress, tokenId, quantity);
            expect(tx).toEqual(mockTx);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
            address: contractAddress,
            abi: ERC1155ABI,
            functionName: 'mint',
            args: [mockWalletClient.account.address, tokenId, quantity, data],
        });
    });

    it('should throw an error when wallet client is not connected', async () => {
        (useWalletClient as Mock).mockReturnValue({ data: null });

        const { result } = renderHook(() => useMintNftERC1155());

        const contractAddress = '0x1234567890123456789012345678901234567890';
        const tokenId = 1;
        const quantity = 10;

        await act(async () => {
            await expect(result.current.mintNftERC1155(contractAddress, tokenId, quantity)).rejects.toThrow(
                'No wallet client connected'
            );
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle mint failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();
        (useWalletClient as Mock).mockReturnValue({ data: mockWalletClient });

        const { result } = renderHook(() => useMintNftERC1155());

        const contractAddress = '0x1234567890123456789012345678901234567890';
        const tokenId = 1;
        const quantity = 10;
        const mockError = new Error('Mint failed');

        mockWalletClient.writeContract.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.mintNftERC1155(contractAddress, tokenId, quantity)).rejects.toThrow(
                'Mint failed'
            );
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to mint NFT');

        // Restore console.error
        console.error = originalConsoleError;
    });
});

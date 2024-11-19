import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateTokenboundAccount } from './useCreateTokenBoundAccount';
import { useTokenbound } from '../useTokenbound';
import { Address } from 'viem';

// Mock useTokenbound hook
vi.mock('../useTokenbound', () => ({
    useTokenbound: vi.fn(),
}));

const mockTokenboundClient = {
    createAccount: vi.fn(),
    getAccount: vi.fn(),
    checkAccountDeployment: vi.fn(),
};

describe('useCreateTokenboundAccount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create token-bound account successfully', async () => {
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });

        const { result } = renderHook(() => useCreateTokenboundAccount());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const tokenId = '1';
        const mockResponse = {
            account: '0x1234567890123456789012345678901234567890',
            txHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
        };

        mockTokenboundClient.createAccount.mockResolvedValue(mockResponse);
        mockTokenboundClient.getAccount.mockResolvedValue(mockResponse.account);
        mockTokenboundClient.checkAccountDeployment.mockResolvedValue(true);

        await act(async () => {
            const response = await result.current.createTokenboundAccount(contractAddress, tokenId);
            expect(response).toEqual(mockResponse);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should throw an error when tokenboundClient is not initialized', async () => {
        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: null });

        const { result } = renderHook(() => useCreateTokenboundAccount());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const tokenId = '1';

        await act(async () => {
            await expect(result.current.createTokenboundAccount(contractAddress, tokenId)).rejects.toThrow(
                'TokenboundClient not initialized'
            );
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle account creation failure', async () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();

        (useTokenbound as vi.Mock).mockReturnValue({ tokenboundClient: mockTokenboundClient });

        const { result } = renderHook(() => useCreateTokenboundAccount());

        const contractAddress: Address = '0x1234567890123456789012345678901234567890';
        const tokenId = '1';
        const mockError = new Error('Account creation failed');

        mockTokenboundClient.createAccount.mockRejectedValue(mockError);

        await act(async () => {
            await expect(result.current.createTokenboundAccount(contractAddress, tokenId)).rejects.toThrow(
                'Account creation failed'
            );
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to create token-bound account');
        // Restore console.error
        console.error = originalConsoleError;
    });
});

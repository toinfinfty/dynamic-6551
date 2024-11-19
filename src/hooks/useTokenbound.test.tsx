import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAccount } from 'wagmi';
import { useTokenbound } from './useTokenbound';
import { TokenboundProvider } from '../contexts/TokenboundProvider';
import React from 'react';

// Mock TokenboundContext
const mockContextValue = {
    tokenboundClient: {},
    address: '0x1234567890123456789012345678901234567890',
};

// Mock WagmiProvider and useAccount
vi.mock('wagmi', async () => {
    const actual = await import('wagmi');
    return {
        ...actual,
        WagmiProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        createConfig: vi.fn(),
        useAccount: vi.fn(),
    };
});

vi.mock('wagmi/connectors', () => ({
    metaMask: vi.fn(),
}));

// Mock TokenboundClient
vi.mock('@tokenbound/sdk', () => ({
    TokenboundClient: vi.fn().mockImplementation(() => ({
        chain: {},
        chainId: 1,
        implementationAddress: '0x1234567890123456789012345678901234567890',
        isInitialized: true,
        publicClient: {},
        registryAddress: '0x1234567890123456789012345678901234567890',
        signer: {},
        supportsV3: true,
        walletClient: {},
    })),
}));

describe('useTokenbound', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAccount as Mock).mockReturnValue({ address: mockContextValue.address });
    });

    it('should return context value when used within TokenboundProvider', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TokenboundProvider>{children}</TokenboundProvider>
        );

        const { result } = renderHook(() => useTokenbound(), { wrapper });

        expect(result.current).toEqual({
            tokenboundClient: expect.any(Object),
            address: mockContextValue.address,
        });
    });

    it('should throw an error when used outside TokenboundProvider', () => {
        // Suppress console.error during this test
        const originalConsoleError = console.error;
        console.error = vi.fn();

        try {
            renderHook(() => useTokenbound());
        } catch (error) {
            expect(error).toEqual(new Error('useTokenbound must be used within a TokenboundProvider'));
        }
        // Restore console.error
        console.error = originalConsoleError;
    });
});

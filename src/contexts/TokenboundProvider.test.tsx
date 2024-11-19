import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { TokenboundProvider, TokenboundContext } from './TokenboundProvider';
import { useAccount } from 'wagmi';
import { getNetworkConfig } from '../utils/networkConfig';
import { createWalletClient, custom } from 'viem';
import { TokenboundClient } from '@tokenbound/sdk';
import React, { useContext } from 'react';

// Mock dependencies
vi.mock('wagmi', () => ({
    useAccount: vi.fn(),
}));

vi.mock('@/utils/networkConfig', () => ({
    getNetworkConfig: vi.fn(),
}));

vi.mock('viem', () => ({
    createWalletClient: vi.fn(),
    custom: vi.fn(),
}));

vi.mock('@tokenbound/sdk', () => ({
    TokenboundClient: vi.fn(),
}));

const MOCK_ADDRESS = '0x1234567890123456789012345678901234567890';
const MOCK_NETWORK_CONFIG = { chainId: 1 };

describe('TokenboundProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAccount as Mock).mockReturnValue({ address: MOCK_ADDRESS });
        (getNetworkConfig as Mock).mockReturnValue(MOCK_NETWORK_CONFIG);
        (createWalletClient as Mock).mockReturnValue({});
    });

    it('should initialize TokenboundClient correctly', async () => {
        const TestComponent = () => {
            const context = useContext(TokenboundContext);
            return (
                <div>
                    <span data-testid="address">{context?.address}</span>
                    <span data-testid="client">{context?.tokenboundClient ? 'initialized' : 'null'}</span>
                </div>
            );
        };

        const { getByTestId } = render(
            <TokenboundProvider>
                <TestComponent />
            </TokenboundProvider>
        );

        await waitFor(() => {
            expect(getByTestId('address').textContent).toBe(MOCK_ADDRESS);
            expect(getByTestId('client').textContent).toBe('initialized');
        });

        expect(TokenboundClient).toHaveBeenCalledWith({
            walletClient: {},
            chain: MOCK_NETWORK_CONFIG,
        });
    });

    it('should not initialize TokenboundClient if address is not available', async () => {
        (useAccount as Mock).mockReturnValue({ address: undefined });

        const TestComponent = () => {
            const context = useContext(TokenboundContext);
            return (
                <div>
                    <span data-testid="address">{context?.address}</span>
                    <span data-testid="client">{context?.tokenboundClient ? 'initialized' : 'null'}</span>
                </div>
            );
        };

        const { getByTestId } = render(
            <TokenboundProvider>
                <TestComponent />
            </TokenboundProvider>
        );

        await waitFor(() => {
            expect(getByTestId('address').textContent).toBe('');
            expect(getByTestId('client').textContent).toBe('null');
        });

        expect(TokenboundClient).not.toHaveBeenCalled();
    });
});

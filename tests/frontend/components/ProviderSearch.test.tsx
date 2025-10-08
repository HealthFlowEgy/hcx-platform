/**
 * ProviderSearch Component Tests
 * Testing provider search and filtering functionality
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/user Event';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProviderSearch } from '@/features/providers/components/ProviderSearch';
import { searchProviders } from '@/api/providers';

jest.mock('@/api/providers');

const mockSearchProviders = searchProviders as jest.MockedFunction<typeof searchProviders>;

const mockProviders = [
  {
    providerId: 'PROV001',
    providerName: 'Cairo University Hospital',
    providerType: 'hospital',
    city: 'Cairo',
    specialty: 'General, Cardiology',
    rating: 4.5,
    distance: 2.3,
  },
  {
    providerId: 'PROV002',
    providerName: 'Alexandria Medical Center',
    providerType: 'hospital',
    city: 'Alexandria',
    specialty: 'Neurology, Orthopedics',
    rating: 4.2,
    distance: 150.5,
  },
  {
    providerId: 'PROV003',
    providerName: 'Nile Pharmacy',
    providerType: 'pharmacy',
    city: 'Cairo',
    specialty: 'Pharmacy',
    rating: 4.8,
    distance: 1.5,
  },
];

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

describe('ProviderSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('should render search input and filters', () => {
      renderWithProviders(<ProviderSearch />);

      expect(screen.getByPlaceholderText(/search providers/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/provider type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specialty/i)).toBeInTheDocument();
    });

    it('should search providers on input', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch />);

      const searchInput = screen.getByPlaceholderText(/search providers/i);
      await user.type(searchInput, 'Cairo');

      await waitFor(() => {
        expect(mockSearchProviders).toHaveBeenCalledWith({
          query: 'Cairo',
        });
      });

      expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      expect(screen.getByText('Nile Pharmacy')).toBeInTheDocument();
    });

    it('should debounce search input', async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch />);

      const searchInput = screen.getByPlaceholderText(/search providers/i);
      await user.type(searchInput, 'Cairo');

      // Should not call immediately
      expect(mockSearchProviders).not.toHaveBeenCalled();

      // Fast forward debounce time
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockSearchProviders).toHaveBeenCalledTimes(1);
      });

      jest.useRealTimers();
    });

    it('should filter by provider type', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce([mockProviders[0], mockProviders[1]]);

      renderWithProviders(<ProviderSearch />);

      const typeSelect = screen.getByLabelText(/provider type/i);
      await user.selectOptions(typeSelect, 'hospital');

      await waitFor(() => {
        expect(mockSearchProviders).toHaveBeenCalledWith({
          providerType: 'hospital',
        });
      });

      expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      expect(screen.getByText('Alexandria Medical Center')).toBeInTheDocument();
      expect(screen.queryByText('Nile Pharmacy')).not.toBeInTheDocument();
    });

    it('should filter by city', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce([mockProviders[0], mockProviders[2]]);

      renderWithProviders(<ProviderSearch />);

      const citySelect = screen.getByLabelText(/city/i);
      await user.selectOptions(citySelect, 'Cairo');

      await waitFor(() => {
        expect(mockSearchProviders).toHaveBeenCalledWith({
          city: 'Cairo',
        });
      });

      expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      expect(screen.getByText('Nile Pharmacy')).toBeInTheDocument();
    });

    it('should combine multiple filters', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce([mockProviders[0]]);

      renderWithProviders(<ProviderSearch />);

      await user.type(screen.getByPlaceholderText(/search providers/i), 'Hospital');
      await user.selectOptions(screen.getByLabelText(/provider type/i), 'hospital');
      await user.selectOptions(screen.getByLabelText(/city/i), 'Cairo');

      await waitFor(() => {
        expect(mockSearchProviders).toHaveBeenCalledWith({
          query: 'Hospital',
          providerType: 'hospital',
          city: 'Cairo',
        });
      });
    });

    it('should clear filters', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValue(mockProviders);

      renderWithProviders(<ProviderSearch />);

      await user.selectOptions(screen.getByLabelText(/provider type/i), 'hospital');
      
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockSearchProviders).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Results Display', () => {
    it('should display provider cards', async () => {
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      });

      const providerCard = screen.getByTestId('provider-card-PROV001');
      expect(within(providerCard).getByText('hospital')).toBeInTheDocument();
      expect(within(providerCard).getByText('Cairo')).toBeInTheDocument();
      expect(within(providerCard).getByText('4.5')).toBeInTheDocument();
      expect(within(providerCard).getByText('2.3 km')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockSearchProviders.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<ProviderSearch />);

      expect(screen.getByText(/loading providers/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show empty state when no results', async () => {
      mockSearchProviders.mockResolvedValueOnce([]);

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText(/no providers found/i)).toBeInTheDocument();
      });
    });

    it('should show error message on failure', async () => {
      mockSearchProviders.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load providers/i)).toBeInTheDocument();
      });
    });

    it('should sort results by distance', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'distance');

      const providerCards = screen.getAllByTestId(/provider-card/);
      expect(providerCards[0]).toHaveTextContent('Nile Pharmacy'); // 1.5 km
      expect(providerCards[1]).toHaveTextContent('Cairo University Hospital'); // 2.3 km
    });

    it('should sort results by rating', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'rating');

      const providerCards = screen.getAllByTestId(/provider-card/);
      expect(providerCards[0]).toHaveTextContent('Nile Pharmacy'); // 4.8
      expect(providerCards[1]).toHaveTextContent('Cairo University Hospital'); // 4.5
    });
  });

  describe('Provider Selection', () => {
    it('should select provider on card click', async () => {
      const user = userEvent.setup();
      const onSelectProvider = jest.fn();
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch onSelectProvider={onSelectProvider} />);

      await waitFor(() => {
        expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      });

      const providerCard = screen.getByTestId('provider-card-PROV001');
      await user.click(providerCard);

      expect(onSelectProvider).toHaveBeenCalledWith(mockProviders[0]);
    });

    it('should show provider details on hover', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      });

      const providerCard = screen.getByTestId('provider-card-PROV001');
      await user.hover(providerCard);

      await waitFor(() => {
        expect(screen.getByText(/general, cardiology/i)).toBeInTheDocument();
      });
    });

    it('should open provider details modal', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce(mockProviders);

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText('Cairo University Hospital')).toBeInTheDocument();
      });

      const detailsButton = screen.getByRole('button', { name: /view details.*PROV001/i });
      await user.click(detailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/provider details/i)).toBeInTheDocument();
      });
    });
  });

  describe('Geolocation', () => {
    it('should request user location', async () => {
      const user = userEvent.setup();
      const mockGeolocation = {
        getCurrentPosition: jest.fn(),
      };
      global.navigator.geolocation = mockGeolocation as any;

      renderWithProviders(<ProviderSearch />);

      const locationButton = screen.getByRole('button', { name: /use my location/i });
      await user.click(locationButton);

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    it('should show nearby providers when location enabled', async () => {
      const user = userEvent.setup();
      mockSearchProviders.mockResolvedValueOnce([mockProviders[0], mockProviders[2]]);

      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) =>
          success({
            coords: {
              latitude: 30.0444,
              longitude: 31.2357,
            },
          })
        ),
      };
      global.navigator.geolocation = mockGeolocation as any;

      renderWithProviders(<ProviderSearch />);

      const locationButton = screen.getByRole('button', { name: /use my location/i });
      await user.click(locationButton);

      await waitFor(() => {
        expect(mockSearchProviders).toHaveBeenCalledWith({
          latitude: 30.0444,
          longitude: 31.2357,
          radius: 10,
        });
      });
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls', async () => {
      mockSearchProviders.mockResolvedValueOnce({
        providers: mockProviders,
        total: 50,
        page: 1,
        pageSize: 10,
      });

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText(/showing 1-10 of 50/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      mockSearchProviders
        .mockResolvedValueOnce({
          providers: mockProviders,
          total: 50,
          page: 1,
          pageSize: 10,
        })
        .mockResolvedValueOnce({
          providers: mockProviders,
          total: 50,
          page: 2,
          pageSize: 10,
        });

      renderWithProviders(<ProviderSearch />);

      await waitFor(() => {
        expect(screen.getByText(/showing 1-10 of 50/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/showing 11-20 of 50/i)).toBeInTheDocument();
      });
    });
  });
});

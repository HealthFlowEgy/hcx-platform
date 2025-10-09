/**
 * ClaimSubmission Component Tests
 * Testing claim submission form with React Testing Library
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClaimSubmissionForm } from '@/features/claims/components/ClaimSubmissionForm';
import { submitClaim } from '@/api/claims';
import { toast } from '@/hooks/use-toast';

// Mock API and toast
jest.mock('@/api/claims');
jest.mock('@/hooks/use-toast');

const mockSubmitClaim = submitClaim as jest.MockedFunction<typeof submitClaim>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

// Test wrapper with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

describe('ClaimSubmissionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all required form fields', () => {
      renderWithProviders(<ClaimSubmissionForm />);

      expect(screen.getByLabelText(/patient id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/provider id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payor id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/policy number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/claim type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/service date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/claim amount/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit claim/i })).toBeInTheDocument();
    });

    it('should render with initial values when provided', () => {
      const initialValues = {
        patientId: 'PAT001',
        providerId: 'PROV001',
        payorId: 'PAYOR001',
        policyNumber: 'POL-123456',
      };

      renderWithProviders(<ClaimSubmissionForm initialValues={initialValues} />);

      expect(screen.getByDisplayValue('PAT001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PROV001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PAYOR001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('POL-123456')).toBeInTheDocument();
    });

    it('should display form title and description', () => {
      renderWithProviders(<ClaimSubmissionForm />);

      expect(screen.getByText(/submit new claim/i)).toBeInTheDocument();
      expect(screen.getByText(/complete the form to submit a claim/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const submitButton = screen.getByRole('button', { name: /submit claim/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/patient id is required/i)).toBeInTheDocument();
        expect(screen.getByText(/provider id is required/i)).toBeInTheDocument();
        expect(screen.getByText(/payor id is required/i)).toBeInTheDocument();
      });
    });

    it('should validate policy number format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const policyInput = screen.getByLabelText(/policy number/i);
      await user.type(policyInput, 'INVALID');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid policy number format/i)).toBeInTheDocument();
      });
    });

    it('should validate claim amount is positive', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const amountInput = screen.getByLabelText(/claim amount/i);
      await user.type(amountInput, '-100');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/amount must be positive/i)).toBeInTheDocument();
      });
    });

    it('should validate service date is not in future', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      
      const dateInput = screen.getByLabelText(/service date/i);
      await user.type(dateInput, futureDate.toISOString().split('T')[0]);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/service date cannot be in the future/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when field is corrected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const patientIdInput = screen.getByLabelText(/patient id/i);
      
      // Trigger validation error
      await user.click(patientIdInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/patient id is required/i)).toBeInTheDocument();
      });

      // Fix the error
      await user.type(patientIdInput, 'PAT001');
      
      await waitFor(() => {
        expect(screen.queryByText(/patient id is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        claimId: 'CLM-12345',
        status: 'SUBMITTED',
        message: 'Claim submitted successfully',
      };

      mockSubmitClaim.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<ClaimSubmissionForm />);

      // Fill form
      await user.type(screen.getByLabelText(/patient id/i), 'PAT001');
      await user.type(screen.getByLabelText(/provider id/i), 'PROV001');
      await user.type(screen.getByLabelText(/payor id/i), 'PAYOR001');
      await user.type(screen.getByLabelText(/policy number/i), 'POL-123456');
      await user.selectOptions(screen.getByLabelText(/claim type/i), 'INPATIENT');
      await user.type(screen.getByLabelText(/service date/i), '2025-10-01');
      await user.type(screen.getByLabelText(/claim amount/i), '5000');
      await user.type(screen.getByLabelText(/diagnosis code/i), 'A00.0');

      // Submit
      await user.click(screen.getByRole('button', { name: /submit claim/i }));

      await waitFor(() => {
        expect(mockSubmitClaim).toHaveBeenCalledWith({
          patientId: 'PAT001',
          providerId: 'PROV001',
          payorId: 'PAYOR001',
          policyNumber: 'POL-123456',
          claimType: 'INPATIENT',
          serviceDate: '2025-10-01',
          claimAmount: 5000,
          diagnosisCode: 'A00.0',
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Claim submitted successfully',
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      mockSubmitClaim.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderWithProviders(<ClaimSubmissionForm />);

      // Fill required fields
      await user.type(screen.getByLabelText(/patient id/i), 'PAT001');
      await user.type(screen.getByLabelText(/provider id/i), 'PROV001');
      await user.type(screen.getByLabelText(/payor id/i), 'PAYOR001');
      await user.type(screen.getByLabelText(/policy number/i), 'POL-123456');

      const submitButton = screen.getByRole('button', { name: /submit claim/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/submitting.../i)).toBeInTheDocument();
    });

    it('should show error message when submission fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network error: Unable to connect to server';
      mockSubmitClaim.mockRejectedValueOnce(new Error(errorMessage));

      renderWithProviders(<ClaimSubmissionForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/patient id/i), 'PAT001');
      await user.type(screen.getByLabelText(/provider id/i), 'PROV001');
      await user.type(screen.getByLabelText(/payor id/i), 'PAYOR001');
      await user.type(screen.getByLabelText(/policy number/i), 'POL-123456');
      
      await user.click(screen.getByRole('button', { name: /submit claim/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      mockSubmitClaim.mockResolvedValueOnce({
        claimId: 'CLM-12345',
        status: 'SUBMITTED',
      });

      renderWithProviders(<ClaimSubmissionForm />);

      // Fill and submit
      const patientIdInput = screen.getByLabelText(/patient id/i) as HTMLInputElement;
      await user.type(patientIdInput, 'PAT001');
      await user.type(screen.getByLabelText(/provider id/i), 'PROV001');
      await user.type(screen.getByLabelText(/payor id/i), 'PAYOR001');
      await user.type(screen.getByLabelText(/policy number/i), 'POL-123456');
      
      await user.click(screen.getByRole('button', { name: /submit claim/i }));

      await waitFor(() => {
        expect(patientIdInput.value).toBe('');
      });
    });
  });

  describe('User Interactions', () => {
    it('should update form state on input change', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const patientIdInput = screen.getByLabelText(/patient id/i) as HTMLInputElement;
      await user.type(patientIdInput, 'PAT001');

      expect(patientIdInput.value).toBe('PAT001');
    });

    it('should show character count for text fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const diagnosisInput = screen.getByLabelText(/diagnosis description/i);
      await user.type(diagnosisInput, 'Patient diagnosed with acute condition');

      expect(screen.getByText(/41 \/ 500/i)).toBeInTheDocument();
    });

    it('should allow saving as draft', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      await user.type(screen.getByLabelText(/patient id/i), 'PAT001');
      
      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveDraftButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Draft Saved',
          description: 'Your progress has been saved',
        });
      });
    });

    it('should confirm before clearing form', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => true);
      
      renderWithProviders(<ClaimSubmissionForm />);

      await user.type(screen.getByLabelText(/patient id/i), 'PAT001');
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all fields?');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<ClaimSubmissionForm />);

      expect(screen.getByLabelText(/patient id/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/provider id/i)).toHaveAttribute('aria-required', 'true');
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const submitButton = screen.getByRole('button', { name: /submit claim/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/patient id is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ClaimSubmissionForm />);

      const patientIdInput = screen.getByLabelText(/patient id/i);
      patientIdInput.focus();

      expect(patientIdInput).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/provider id/i)).toHaveFocus();
    });
  });
});

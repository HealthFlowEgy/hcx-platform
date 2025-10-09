/**
 * End-to-End Tests for Claim Submission Workflow
 * Tests complete user journey from login to claim submission
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */

describe('Claim Submission Workflow', () => {
  beforeEach(() => {
    // Reset database and seed test data
    cy.task('db:seed');
    
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="username"]').type('provider@test.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="dashboard-title"]').should('be.visible');
  });

  describe('Navigation', () => {
    it('should navigate to claim submission page', () => {
      cy.get('[data-testid="nav-claims"]').click();
      cy.get('[data-testid="new-claim-button"]').click();
      
      cy.url().should('include', '/claims/new');
      cy.get('h1').should('contain', 'Submit New Claim');
    });

    it('should show breadcrumb navigation', () => {
      cy.visit('/claims/new');
      
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Dashboard');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Claims');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'New Claim');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      cy.visit('/claims/new');
    });

    it('should show validation errors for empty form', () => {
      cy.get('[data-testid="submit-button"]').click();
      
      cy.get('[data-testid="error-patient-id"]').should('be.visible');
      cy.get('[data-testid="error-provider-id"]').should('be.visible');
      cy.get('[data-testid="error-payor-id"]').should('be.visible');
      cy.get('[data-testid="error-policy-number"]').should('be.visible');
    });

    it('should validate policy number format', () => {
      cy.get('[data-testid="policy-number"]').type('INVALID');
      cy.get('[data-testid="policy-number"]').blur();
      
      cy.get('[data-testid="error-policy-number"]')
        .should('be.visible')
        .and('contain', 'Invalid policy number format');
    });

    it('should validate claim amount is positive', () => {
      cy.get('[data-testid="claim-amount"]').type('-100');
      cy.get('[data-testid="claim-amount"]').blur();
      
      cy.get('[data-testid="error-claim-amount"]')
        .should('be.visible')
        .and('contain', 'Amount must be positive');
    });

    it('should validate service date is not in future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      cy.get('[data-testid="service-date"]').type(futureDateStr);
      cy.get('[data-testid="service-date"]').blur();
      
      cy.get('[data-testid="error-service-date"]')
        .should('be.visible')
        .and('contain', 'cannot be in the future');
    });

    it('should clear validation errors when corrected', () => {
      // Trigger error
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="error-patient-id"]').should('be.visible');
      
      // Fix error
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="error-patient-id"]').should('not.exist');
    });
  });

  describe('Form Filling', () => {
    beforeEach(() => {
      cy.visit('/claims/new');
    });

    it('should fill all required fields', () => {
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="provider-id"]').type('PROV001');
      cy.get('[data-testid="payor-id"]').type('PAYOR001');
      cy.get('[data-testid="policy-number"]').type('POL-123456');
      cy.get('[data-testid="claim-type"]').select('INPATIENT');
      cy.get('[data-testid="service-date"]').type('2025-10-01');
      cy.get('[data-testid="claim-amount"]').type('5000');
      cy.get('[data-testid="diagnosis-code"]').type('A00.0');
      
      // Verify all fields are filled
      cy.get('[data-testid="patient-id"]').should('have.value', 'PAT001');
      cy.get('[data-testid="provider-id"]').should('have.value', 'PROV001');
      cy.get('[data-testid="payor-id"]').should('have.value', 'PAYOR001');
      cy.get('[data-testid="policy-number"]').should('have.value', 'POL-123456');
      cy.get('[data-testid="claim-type"]').should('have.value', 'INPATIENT');
      cy.get('[data-testid="service-date"]').should('have.value', '2025-10-01');
      cy.get('[data-testid="claim-amount"]').should('have.value', '5000');
      cy.get('[data-testid="diagnosis-code"]').should('have.value', 'A00.0');
    });

    it('should auto-complete patient information', () => {
      cy.get('[data-testid="patient-id"]').type('PAT');
      
      cy.get('[data-testid="autocomplete-dropdown"]').should('be.visible');
      cy.get('[data-testid="autocomplete-option"]').first().click();
      
      cy.get('[data-testid="patient-id"]').should('have.value', 'PAT001');
      cy.get('[data-testid="patient-name"]').should('not.be.empty');
    });

    it('should calculate total amount from line items', () => {
      cy.get('[data-testid="add-line-item"]').click();
      
      cy.get('[data-testid="line-item-0-quantity"]').type('2');
      cy.get('[data-testid="line-item-0-unit-price"]').type('1000');
      
      cy.get('[data-testid="add-line-item"]').click();
      cy.get('[data-testid="line-item-1-quantity"]').type('3');
      cy.get('[data-testid="line-item-1-unit-price"]').type('500');
      
      cy.get('[data-testid="total-amount"]').should('contain', '3500');
    });
  });

  describe('Claim Submission', () => {
    beforeEach(() => {
      cy.visit('/claims/new');
    });

    it('should submit claim successfully', () => {
      // Fill form
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="provider-id"]').type('PROV001');
      cy.get('[data-testid="payor-id"]').type('PAYOR001');
      cy.get('[data-testid="policy-number"]').type('POL-123456');
      cy.get('[data-testid="claim-type"]').select('INPATIENT');
      cy.get('[data-testid="service-date"]').type('2025-10-01');
      cy.get('[data-testid="claim-amount"]').type('5000');
      cy.get('[data-testid="diagnosis-code"]').type('A00.0');
      
      // Submit
      cy.get('[data-testid="submit-button"]').click();
      
      // Verify success
      cy.get('[data-testid="success-toast"]')
        .should('be.visible')
        .and('contain', 'Claim submitted successfully');
      
      // Should redirect to claim details
      cy.url().should('match', /\/claims\/CLM-\w+/);
      cy.get('[data-testid="claim-status"]').should('contain', 'SUBMITTED');
    });

    it('should show loading state during submission', () => {
      // Fill form
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="provider-id"]').type('PROV001');
      cy.get('[data-testid="payor-id"]').type('PAYOR001');
      cy.get('[data-testid="policy-number"]').type('POL-123456');
      
      // Submit
      cy.get('[data-testid="submit-button"]').click();
      
      // Verify loading state
      cy.get('[data-testid="submit-button"]').should('be.disabled');
      cy.get('[data-testid="submit-button"]').should('contain', 'Submitting...');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });

    it('should handle submission errors', () => {
      // Mock API error
      cy.intercept('POST', '/api/v1/claims/submit', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      });
      
      // Fill and submit form
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="provider-id"]').type('PROV001');
      cy.get('[data-testid="payor-id"]').type('PAYOR001');
      cy.get('[data-testid="policy-number"]').type('POL-123456');
      cy.get('[data-testid="submit-button"]').click();
      
      // Verify error message
      cy.get('[data-testid="error-toast"]')
        .should('be.visible')
        .and('contain', 'Failed to submit claim');
    });

    it('should save draft', () => {
      // Fill partial form
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="provider-id"]').type('PROV001');
      
      // Save draft
      cy.get('[data-testid="save-draft-button"]').click();
      
      // Verify success
      cy.get('[data-testid="success-toast"]')
        .should('be.visible')
        .and('contain', 'Draft saved');
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/claims/new');
      
      // Verify draft is loaded
      cy.get('[data-testid="patient-id"]').should('have.value', 'PAT001');
      cy.get('[data-testid="provider-id"]').should('have.value', 'PROV001');
    });
  });

  describe('Eligibility Check', () => {
    beforeEach(() => {
      cy.visit('/claims/new');
    });

    it('should check eligibility before submission', () => {
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="policy-number"]').type('POL-123456');
      cy.get('[data-testid="payor-id"]').type('PAYOR001');
      
      cy.get('[data-testid="check-eligibility-button"]').click();
      
      cy.get('[data-testid="eligibility-result"]').should('be.visible');
      cy.get('[data-testid="eligibility-status"]').should('contain', 'Eligible');
      cy.get('[data-testid="coverage-amount"]').should('be.visible');
    });

    it('should show ineligible status', () => {
      cy.intercept('POST', '/api/v1/eligibility/check', {
        statusCode: 200,
        body: { eligible: false, reason: 'Policy expired' },
      });
      
      cy.get('[data-testid="patient-id"]').type('PAT001');
      cy.get('[data-testid="policy-number"]').type('EXPIRED-POLICY');
      cy.get('[data-testid="payor-id"]').type('PAYOR001');
      
      cy.get('[data-testid="check-eligibility-button"]').click();
      
      cy.get('[data-testid="eligibility-status"]').should('contain', 'Ineligible');
      cy.get('[data-testid="eligibility-reason"]').should('contain', 'Policy expired');
    });
  });

  describe('Document Upload', () => {
    beforeEach(() => {
      cy.visit('/claims/new');
    });

    it('should upload supporting documents', () => {
      cy.get('[data-testid="upload-documents"]').click();
      
      const fileName = 'prescription.pdf';
      cy.get('[data-testid="file-input"]').attachFile(fileName);
      
      cy.get('[data-testid="uploaded-file"]')
        .should('be.visible')
        .and('contain', fileName);
    });

    it('should validate file types', () => {
      cy.get('[data-testid="upload-documents"]').click();
      
      cy.get('[data-testid="file-input"]').attachFile('invalid.exe');
      
      cy.get('[data-testid="error-toast"]')
        .should('be.visible')
        .and('contain', 'Invalid file type');
    });

    it('should validate file size', () => {
      cy.get('[data-testid="upload-documents"]').click();
      
      // Mock large file
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf');
      cy.get('[data-testid="file-input"]').selectFile(largeFile, { force: true });
      
      cy.get('[data-testid="error-toast"]')
        .should('be.visible')
        .and('contain', 'File size exceeds limit');
    });

    it('should remove uploaded document', () => {
      cy.get('[data-testid="upload-documents"]').click();
      cy.get('[data-testid="file-input"]').attachFile('prescription.pdf');
      
      cy.get('[data-testid="uploaded-file"]').should('be.visible');
      
      cy.get('[data-testid="remove-file-button"]').click();
      
      cy.get('[data-testid="uploaded-file"]').should('not.exist');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.visit('/claims/new');
    });

    it('should display mobile-friendly form', () => {
      cy.get('[data-testid="claim-form"]').should('be.visible');
      cy.get('[data-testid="patient-id"]').should('be.visible');
    });

    it('should have clickable buttons on mobile', () => {
      cy.get('[data-testid="submit-button"]').should('be.visible');
      cy.get('[data-testid="submit-button"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="error-patient-id"]').should('be.visible');
    });

    it('should scroll to first error on mobile', () => {
      cy.get('[data-testid="submit-button"]').click();
      
      cy.get('[data-testid="patient-id"]').should('be.inViewport');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/claims/new');
      cy.injectAxe();
    });

    it('should have no accessibility violations', () => {
      cy.checkA11y();
    });

    it('should be keyboard navigable', () => {
      cy.get('[data-testid="patient-id"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'patient-id');
      
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'data-testid', 'provider-id');
      
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'data-testid', 'payor-id');
    });

    it('should announce validation errors to screen readers', () => {
      cy.get('[data-testid="submit-button"]').click();
      
      cy.get('[data-testid="error-patient-id"]')
        .should('have.attr', 'role', 'alert')
        .and('have.attr', 'aria-live', 'polite');
    });
  });
});

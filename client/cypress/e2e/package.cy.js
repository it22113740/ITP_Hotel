describe('Package Page', () => {
    const mockPackages = [
      {
        packageId: '1',
        packageName: 'Basic Package',
        packageImage: 'https://example.com/basic-package.jpg',
        size: 2,
        price: 1000,
        _id: '1',
      },
      {
        packageId: '2',
        packageName: 'Premium Package',
        packageImage: 'https://example.com/premium-package.jpg',
        size: 4,
        price: 2000,
        _id: '2',
      },
    ];
  
    beforeEach(() => {
      // Mock the backend API response for fetching packages
      cy.intercept('GET', '/api/package/getPackages', {
        statusCode: 200,
        body: { packages: mockPackages },
      }).as('fetchPackages');
  
      // Visit the package page
      cy.visit('/packages');  // Change the URL as per your setup
    });
  
    it('should display the packages correctly', () => {
      // Wait for the API call to fetch packages
      cy.wait('@fetchPackages');
  
      // Ensure that the packages are displayed
      cy.get('.pkg_container').should('be.visible');
      cy.get('.pkg_card').should('have.length', mockPackages.length);
  
      // Check that the first package is rendered
      cy.get('.pkg_card').first().within(() => {
        cy.get('.pkg_title').should('contain', mockPackages[0].packageName);
        cy.get('.pkg_size').should('contain', `Size: ${mockPackages[0].size} Person`);
        cy.get('.pkg_price').should('contain', `From Rs: ${mockPackages[0].price}`);
        cy.get('button.pkg_button').should('contain', 'More Info');
      });
    });
  
    it('should navigate to the package details page when "More Info" is clicked', () => {
      // Intercept the navigation and simulate clicking the 'More Info' button
      cy.get('.pkg_card').first().within(() => {
        cy.get('button.pkg_button').click();
      });
  
      // Verify that the navigation was successful
      cy.url().should('include', '/packages/1');  // Check that the URL includes the package ID
    });
  
    it('should show an empty state if no packages are available', () => {
      // Mock the response with no packages
      cy.intercept('GET', '/api/package/getPackages', {
        statusCode: 200,
        body: { packages: [] },
      }).as('fetchPackagesEmpty');
  
      // Reload the page and wait for the API call
      cy.visit('/packages');
      cy.wait('@fetchPackagesEmpty');
  
      // Ensure that no packages are displayed
      cy.get('.pkg_container').should('be.empty');
      cy.contains('No packages available').should('be.visible');  // You may need to add a fallback message in the UI for this
    });
  
    it('should handle error when packages fail to load', () => {
      // Simulate a failed API call (e.g., network error)
      cy.intercept('GET', '/api/package/getPackages', {
        statusCode: 500,
        body: { error: 'Failed to fetch packages' },
      }).as('fetchPackagesError');
  
      // Reload the page and wait for the error
      cy.visit('/packages');
      cy.wait('@fetchPackagesError');
  
      // Ensure the error handling UI is visible
      cy.contains('Failed to fetch packages').should('be.visible');  // Adjust based on your UI error handling
    });
  });
  
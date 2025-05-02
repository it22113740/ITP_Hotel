describe('Parking Page', () => {
    const mockUser = {
      userID: 'testUserID',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
    };
  
    const mockAvailability = ['B1', 'B2', 'C21', 'C22']; // Mock available parking slots
    const mockPrice = 500; // Mock price for the parking slot
  
    beforeEach(() => {
      // Mock the localStorage to simulate a logged-in user
      window.localStorage.setItem('currentUser', JSON.stringify(mockUser));
  
      // Intercept the API calls to simulate fetching availability and booking the slot
      cy.intercept('GET', '/api/parking/availability', {
        statusCode: 200,
        body: mockAvailability,
      }).as('fetchAvailability');
  
      cy.intercept('POST', '/api/parking/book', {
        statusCode: 200,
        body: { success: true, message: 'Parking slot booked successfully.' },
      }).as('bookParkingSlot');
  
      cy.visit('/parking'); // Visit the Parking Page
    });
  
    it('should load the Parking Page correctly', () => {
      cy.wait('@fetchAvailability'); // Wait for the API response
  
      // Check if the page is loaded
      cy.get('.parking-page1244').should('be.visible');
      cy.get('.date-picker-container1244').should('be.visible');
      cy.get('.availability-grid1244').should('be.visible');
    });
  
    it('should display available parking slots for the selected date', () => {
      cy.get('input[type="date"]').type('2023-05-15'); // Select a date
      cy.wait('@fetchAvailability'); // Wait for the availability to be fetched
  
      // Check if the available slots are displayed
      cy.get('.availability-grid1244').find('.cell1244.available1244').should('have.length', mockAvailability.length);
  
      // Check the first available slot
      cy.get('.cell1244').first().should('contain', 'B1');
    });
  
    it('should display the correct price based on selected slot and duration', () => {
      // Select a date and wait for availability
      cy.get('input[type="date"]').type('2023-05-15');
      cy.wait('@fetchAvailability');
  
      // Select a slot and duration
      cy.get('select.slot-select1244').select('B1');
      cy.get('select.duration-select1244').select('Full day');
  
      // Check if the price is calculated correctly
      cy.get('.price-display1244').should('contain', `Price: LKR ${mockPrice}`);
    });
  
    it('should show an error message if vehicle number is invalid', () => {
      cy.get('input[type="date"]').type('2023-05-15'); // Select a date
      cy.wait('@fetchAvailability'); // Wait for availability
  
      // Select a slot and duration
      cy.get('select.slot-select1244').select('B1');
      cy.get('select.duration-select1244').select('Full day');
  
      // Enter an invalid vehicle number
      cy.get('input.vehicle-number-input1244').type('ABC12'); // Invalid vehicle number (should be ABC1234)
      
      // Attempt to book
      cy.get('button.book-now-btn1244').click();
  
      // Verify that the error message is shown
      cy.contains('Vehicle number must have exactly 3 capital letters followed by 4 digits (e.g., ABC1234).').should('be.visible');
    });
  
    it('should book a parking slot successfully', () => {
      cy.get('input[type="date"]').type('2023-05-15'); // Select a date
      cy.wait('@fetchAvailability'); // Wait for availability
  
      // Select a slot and duration
      cy.get('select.slot-select1244').select('B1');
      cy.get('select.duration-select1244').select('Full day');
  
      // Enter a valid vehicle number
      cy.get('input.vehicle-number-input1244').type('ABC1234');
  
      // Click the "Book Now" button
      cy.get('button.book-now-btn1244').click();
  
      // Wait for the booking response
      cy.wait('@bookParkingSlot');
  
      // Verify success message
      cy.contains('Parking slot booked successfully.').should('be.visible');
    });
  
    it('should disable the booking button if no date is selected', () => {
      // Ensure no date is selected and check if the button is disabled
      cy.get('button.book-now-btn1244').should('be.disabled');
    });
  
    it('should show a message if no parking slots are available for the selected date', () => {
      // Mock the response to simulate no available slots
      cy.intercept('GET', '/api/parking/availability', {
        statusCode: 200,
        body: [],
      }).as('fetchNoAvailability');
  
      cy.visit('/parking'); // Visit the page again
      cy.get('input[type="date"]').type('2023-05-15'); // Select a date
      cy.wait('@fetchNoAvailability');
  
      // Ensure no slots are available
      cy.contains('No parking slots available for the selected date').should('be.visible');
    });
  });
  
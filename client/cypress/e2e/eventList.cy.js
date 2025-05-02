describe('Event List Page', () => {
    const mockEvents = [
      {
        eventId: '1',
        eventName: 'Music Concert',
        eventType: 'Concert',
        price: 5000,
        baseImage: 'https://example.com/music-concert.jpg',
        facilities: ['VIP Access', 'Free Drinks'],
      },
      {
        eventId: '2',
        eventName: 'Art Exhibition',
        eventType: 'Exhibition',
        price: 2000,
        baseImage: 'https://example.com/art-exhibition.jpg',
        facilities: ['Gallery Access'],
      },
    ];
  
    beforeEach(() => {
      // Intercept the API call to fetch events
      cy.intercept('GET', '/api/event/getEvents', {
        statusCode: 200,
        body: { events: mockEvents },
      }).as('fetchEvents');
  
      // Visit the Event List page
      cy.visit('/events');  // Adjust to your Event List page URL
    });
  
    it('should load the Event List page correctly', () => {
      cy.wait('@fetchEvents'); // Wait for the API call to fetch events
  
      // Check that the page is loaded
      cy.contains('Our Events').should('be.visible');
      cy.get('.event-list').should('be.visible');
    });
  
    it('should display "Loading..." when events are being fetched', () => {
      // Intercept the API to simulate a delay
      cy.intercept('GET', '/api/event/getEvents', {
        delay: 1000,  // Add delay to simulate loading
        statusCode: 200,
        body: { events: [] },
      }).as('fetchEventsWithDelay');
  
      cy.visit('/events'); // Revisit the Event List page with delay
      cy.contains('Loading...').should('be.visible'); // Check that loading is displayed
      cy.wait('@fetchEventsWithDelay'); // Wait for the API call to complete
    });
  
    it('should show error message when fetching events fails', () => {
      // Simulate an API failure
      cy.intercept('GET', '/api/event/getEvents', {
        statusCode: 500,
        body: { error: 'Failed to fetch events' },
      }).as('fetchEventsError');
  
      cy.visit('/events');
      cy.wait('@fetchEventsError'); // Wait for the error response
  
      // Check that the error message is displayed
      cy.contains('Failed to fetch events').should('be.visible');
    });
  
    it('should display events correctly when fetched successfully', () => {
      cy.wait('@fetchEvents'); // Wait for the API response
  
      // Check that events are rendered
      cy.get('.event').should('have.length', mockEvents.length); // Verify the number of events
  
      // Check the content of the first event
      cy.get('.event').first().within(() => {
        cy.get('h2').should('contain', mockEvents[0].eventName);
        cy.get('p').should('contain', `Type: ${mockEvents[0].eventType}`);
        cy.get('p').should('contain', `Rs ${mockEvents[0].price}`);
        cy.get('button').should('contain', 'More Info');
      });
    });
  
    it('should filter events correctly based on the search term', () => {
      cy.wait('@fetchEvents');
  
      // Type in the search input to filter events
      cy.get('input[type="text"]').type('Music');
  
      // Check if the event list is filtered correctly
      cy.get('.event').should('have.length', 1);
      cy.get('.event').first().within(() => {
        cy.get('h2').should('contain', 'Music Concert');
      });
    });
  
    it('should navigate to event details page when "More Info" is clicked', () => {
      cy.wait('@fetchEvents');
  
      // Click on the "More Info" button for the first event
      cy.get('.event').first().find('button').click();
  
      // Verify that the URL has changed to the event details page for the selected event
      cy.url().should('include', '/events/1');
    });
  
    it('should display no events available message when no events are fetched', () => {
      // Simulate no events being fetched
      cy.intercept('GET', '/api/event/getEvents', {
        statusCode: 200,
        body: { events: [] },
      }).as('fetchNoEvents');
  
      cy.visit('/events');
      cy.wait('@fetchNoEvents');
  
      // Ensure that "No events available" message is shown
      cy.contains('No events available.').should('be.visible');
    });
  });
  
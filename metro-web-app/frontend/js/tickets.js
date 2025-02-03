// frontend/tickets.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        headers: {
          'x-auth-token': token,
        },
      });
      const tickets = await response.json();
      const ticketList = document.getElementById('ticket-list');
      tickets.forEach((ticket) => {
        const li = document.createElement('li');
        li.textContent = `Ticket Type: ${ticket.ticketType}, Expires on: ${new Date(ticket.expiryDate).toLocaleString()}`;
        ticketList.appendChild(li);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  });

  // frontend/js/tickets.js
let selectedTicketType = null;

function selectTicket(element) {
    // Remove selection from all cards
    document.querySelectorAll('.ticket-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    element.classList.add('selected');
    selectedTicketType = element.dataset.type;
    
    // Show purchase summary
    const summary = document.getElementById('purchase-summary');
    if (summary) {
        summary.style.display = 'block';
        summary.innerHTML = `
            <h3>Selected Ticket</h3>
            <div class="selected-ticket">
                <div class="ticket-type">${element.querySelector('.ticket-type').textContent}</div>
                <div class="ticket-price">${element.querySelector('.ticket-price').textContent}</div>
            </div>
            <button id="confirm-purchase" class="confirm-btn">
                <i class="fas fa-ticket"></i> Purchase Ticket
            </button>
        `;

        // Add purchase handler
        document.getElementById('confirm-purchase').addEventListener('click', purchaseTicket);
    }
}

function purchaseTicket() {
    if (!selectedTicketType) {
        alert('Please select a ticket type');
        return;
    }

    try {
        const ticketData = {
            type: selectedTicketType,
            purchaseDate: new Date().toISOString(),
            validUntil: new Date(Date.now() + getValidityPeriod(selectedTicketType)).toISOString(),
            ticketId: Math.random().toString(36).substr(2, 9)
        };

        saveTicket(ticketData);
        alert('Ticket purchased successfully!');
        
        // Reset UI
        selectedTicketType = null;
        document.querySelectorAll('.ticket-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('purchase-summary').style.display = 'none';
        
        // Refresh tickets display
        displayUserTickets();
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        alert('Error purchasing ticket. Please try again.');
    }
}

function saveTicket(ticketData) {
    const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    existingTickets.push(ticketData);
    localStorage.setItem('userTickets', JSON.stringify(existingTickets));
}

function displayUserTickets() {
    const ticketList = document.getElementById('ticket-list');
    if (!ticketList) return;

    const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    
    if (tickets.length === 0) {
        ticketList.innerHTML = '<div class="no-tickets">No tickets found</div>';
        return;
    }

    ticketList.innerHTML = '';
    tickets.forEach(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.className = 'ticket';
        ticketElement.innerHTML = `
            <div class="ticket-header">
                <span>${getTicketTypeName(ticket.type)}</span>
                <span>${isTicketValid(ticket.validUntil) ? 'Active' : 'Expired'}</span>
            </div>
            <div class="ticket-body">
                <div class="ticket-qr" id="qr-${ticket.ticketId}"></div>
                <div class="ticket-info">
                    <p><strong>Valid Until:</strong> ${new Date(ticket.validUntil).toLocaleString()}</p>
                    <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
                </div>
            </div>
        `;
        ticketList.appendChild(ticketElement);

        // Generate QR code
        new QRCode(document.getElementById(`qr-${ticket.ticketId}`), {
            text: JSON.stringify(ticket),
            width: 128,
            height: 128
        });
    });
}

function getValidityPeriod(type) {
    switch(type) {
        case '2hours': return 2 * 60 * 60 * 1000;
        case '1day': return 24 * 60 * 60 * 1000;
        case '1month': return 30 * 24 * 60 * 60 * 1000;
        default: return 0;
    }
}

function getTicketTypeName(type) {
    switch(type) {
        case '2hours': return '2 Hour Pass';
        case '1day': return 'Day Pass';
        case '1month': return 'Month Pass';
        default: return 'Ticket';
    }
}

function isTicketValid(validUntil) {
    return new Date(validUntil) > new Date();
}

// Initialize tickets display when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    displayUserTickets();
});
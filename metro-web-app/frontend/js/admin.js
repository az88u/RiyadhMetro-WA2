// frontend/admin.js


document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
  
    try {
      // Fetch users
      const userResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'x-auth-token': token,
        },
      });
      const users = await userResponse.json();
      const userList = document.getElementById('user-list');
      users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = `Username: ${user.username}, Email: ${user.email}, User Type: ${user.userType}`;
        userList.appendChild(li);
      });
  
      // Fetch tickets
      const ticketResponse = await fetch('http://localhost:5000/api/admin/tickets', {
        headers: {
          'x-auth-token': token,
        },
      });
      const tickets = await ticketResponse.json();
      const ticketList = document.getElementById('admin-ticket-list');
      tickets.forEach((ticket) => {
        const li = document.createElement('li');
        li.textContent = `Ticket Type: ${ticket.ticketType}, User: ${ticket.user.username}, Expires on: ${new Date(ticket.expiryDate).toLocaleString()}`;
        ticketList.appendChild(li);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  });

  function checkAdminAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }

    const userData = JSON.parse(user);
    console.log('User data:', userData); // Debug log

    if (userData.userType !== 'admin') {
        console.log('Not an admin, redirecting...'); // Debug log
        window.location.href = 'app.html';
        return null;
    }

    return userData;
}

 
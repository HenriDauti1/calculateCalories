document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    updateReports();
    initializeCharts();
    getAllCaloriesData();

    setInterval(() => {
        updateReports();
    }, 300000);
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + '-section').classList.add('active');
}

function loadUsers() {
    const userTable = document.getElementById('userTable');
    fetch("http://localhost:8080/api/users")
        .then(response => response.json())
        .then(users => {
            userTable.innerHTML = ''; // Clear existing rows
            users.forEach(user => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', user.id);
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td><a href="#" class="username-link" onclick="showUserCalories('${user.username}')">${user.username}</a></td>
                    <td>${user.email}</td>
                    <td>USER</td>
                    <td>
                        <button class="btn btn-blue" onclick="makeRowEditable(this)">Edit</button>
                        <button class="btn btn-red" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                `;
                userTable.appendChild(row);
            });
        });
}

function makeRowEditable(button) {
    const row = button.closest('tr');
    const userId = row.getAttribute('data-id');
    const cells = row.cells;

    if (!row.hasAttribute('data-original')) {
        row.setAttribute('data-original', row.innerHTML);
    }

    row.classList.add('edit-mode');

    const editableFields = ['firstName', 'lastName', 'username', 'email'];
    editableFields.forEach((field, index) => {
        const cell = cells[index + 1];
        const currentValue = cell.textContent;
        cell.innerHTML = `<input type="text" name="${field}" value="${currentValue}">`;
    });

    const actionCell = cells[cells.length - 1];
    actionCell.innerHTML = `
        <button class="btn save-btn" onclick="saveChanges(this)">Save</button>
        <button class="btn cancel-btn" onclick="cancelEdit(this)">Cancel</button>
    `;
}

function saveChanges(button) {
    const row = button.closest('tr');
    const userId = row.getAttribute('data-id');
    const inputs = row.getElementsByTagName('input');

    const updatedUser = {
        id: userId,
        firstName: inputs[0].value,
        lastName: inputs[1].value,
        username: inputs[2].value,
        email: inputs[3].value
    };

    fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify(updatedUser)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Update failed');
            }
            return response.json();
        })
        .then(data => {
            loadUsers();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update user');
        });
}

function cancelEdit(button) {
    const row = button.closest('tr');
    const originalContent = row.getAttribute('data-original');

    if (originalContent) {
        row.innerHTML = originalContent;
        row.classList.remove('edit-mode');
        row.removeAttribute('data-original');
    }
}

function deleteUser(userID) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`http://localhost:8080/api/users/${userID}`, {
            method: 'DELETE', headers: {'Content-Type': 'application/json'},
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(err => {
                        throw new Error(err || "Unknown error occurred");
                    });
                }
                return response.text();
            })
            .then(data => {
                console.log(data);
                loadUsers(); // Reload the user list
            })
            .catch(error => {
                console.error("Error:", error.message);
                alert('Failed to delete user');
            });
    }
}

function loadFoodEntries() {
    const entriesTable = document.getElementById('entriesTable');
    const dateFilter = document.querySelector('#entries-section input[type="date"]').value;

    const fromDate = dateFilter ? `${dateFilter}T00:00:00` : new Date().toISOString().split('T')[0] + 'T00:00:00';
    const toDate = dateFilter ? `${dateFilter}T23:59:59` : new Date().toISOString().split('T')[0] + 'T23:59:59';

    fetch(`http://localhost:8080/calories/data`,{
     headers: {
        'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa("Admin" + ':' + "Test123!")
    }
    })
        .then(response => response.json())
        .then(data => {
            entriesTable.innerHTML = '';

            if (data) {
                data.forEach(entry => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${entry.username}</td>
                        <td>${entry.foodName}</td>
                        <td>${entry.calories}</td>
                        <td>$${entry.price.toFixed(2)}</td>
                        <td>${new Date(entry.dateTime).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-blue" onclick="editEntry(${entry.id})">Edit</button>
                            <button class="btn btn-red" onclick="deleteEntry(${entry.id}, '${entry.username}')">Delete</button>
                        </td>
                    `;
                    entriesTable.appendChild(row);
                });
            }
        })
        .catch(error => console.error('Error loading food entries:', error));
}

function deleteEntry(entryId, username) {
    if (confirm('Are you sure you want to delete this entry?')) {
        fetch(`http://localhost:8080/calories/delete/${entryId}?username=${username}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok || response.status === 204) {
                    // loadFoodEntries();
                } else {
                    throw new Error('Failed to delete entry');
                }
            })
            .catch(error => {
                console.error('Error deleting entry:', error);
                alert('Failed to delete entry');
            });
    }
}

function showUserCalories(username) {
    let modal = document.getElementById('userCaloriesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userCaloriesModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Calories Data for <span id="modalUsername"></span></h2>
                <div class="modal-tabs">
                    <button class="tab-btn active" onclick="switchTab('recent')">Recent Entries</button>
                    <button class="tab-btn" onclick="switchTab('weekly')">Weekly Summary</button>
                    <button class="tab-btn" onclick="switchTab('exceeding')">Exceeding Days</button>
                </div>
                <div id="recent-entries" class="tab-content active">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Food Item</th>
                                <th>Calories</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody id="userEntriesTable"></tbody>
                    </table>
                </div>
                <div id="weekly-summary" class="tab-content">
                    <canvas id="userWeeklyChart"></canvas>
                </div>
                <div id="exceeding-days" class="tab-content">
                    <h3>Days Exceeding 2500 Calories</h3>
                    <div id="exceedingDaysList"></div>
                </div>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(modal, mainContent.firstChild);

        modal.querySelector('.close-modal').onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    document.getElementById('modalUsername').textContent = username;
    loadUserCaloriesData(username);
    modal.style.display = 'block';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}-entries`).classList.add('active');
    event.target.classList.add('active');
}

function loadUserCaloriesData(username) {
    fetch(`http://localhost:8080/calories/user/${username}`)
        .then(response => response.json())
        .then(data => {
            const entriesTable = document.getElementById('userEntriesTable');
            entriesTable.innerHTML = '';

            data.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(entry.dateTime).toLocaleString()}</td>
                    <td>${entry.foodName}</td>
                    <td>${entry.calories}</td>
                    <td>$${entry.price.toFixed(2)}</td>
                `;
                entriesTable.appendChild(row);
            });
        });

    fetch(`http://localhost:8080/calories/user/${username}/total-calories-week`)
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('userWeeklyChart').getContext('2d');

            const existingChart = Chart.getChart('userWeeklyChart');
            if (existingChart) {
                existingChart.destroy();
            }

            new Chart(ctx, {
                type: 'bar', data: {
                    labels: Object.keys(data).map(date => new Date(date).toLocaleDateString()), datasets: [{
                        label: 'Daily Calories', data: Object.values(data), backgroundColor: '#3b82f6'
                    }]
                }, options: {
                    responsive: true, scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });

    fetch(`http://localhost:8080/calories/user/${username}/exceeding-2500`)
        .then(response => response.text())
        .then(data => {
            const exceedingList = document.getElementById('exceedingDaysList');
            exceedingList.innerHTML = '';

            if (typeof data === 'string') {
                exceedingList.innerHTML = `<p>${data}</p>`;
            } else {
                Object.entries(data).forEach(([date, calories]) => {
                    exceedingList.innerHTML += `
                        <div class="exceeding-day">
                            <span>${new Date(date).toLocaleDateString()}</span>
                            <span>${calories} calories</span>
                        </div>
                    `;
                });
            }
        });
}

function initializeCharts() {
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    new Chart(activityCtx, {
        type: 'line', data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{
                label: 'Active Users', data: [450, 420, 480, 470, 460, 440, 456], borderColor: '#3b82f6', tension: 0.1
            }]
        }
    });

    const weeklyCtx = document.getElementById('weeklyComparisonChart').getContext('2d');
    new Chart(weeklyCtx, {
        type: 'bar', data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{
                label: 'This Week', data: [120, 150, 180, 90, 100, 60, 70], backgroundColor: '#3b82f6'
            }, {
                label: 'Last Week', data: [100, 120, 140, 80, 90, 50, 60], backgroundColor: '#93c5fd'
            }]
        }
    });

    const avgCtx = document.getElementById('averageCaloriesChart').getContext('2d');
    new Chart(avgCtx, {
        type: 'bar', data: {
            labels: ['User 1', 'User 2', 'User 3', 'User 4', 'User 5'], datasets: [{
                label: 'Average Daily Calories', data: [2200, 2400, 1900, 2600, 2300], backgroundColor: '#3b82f6'
            }]
        }
    });
}

function updateReports() {
    fetch('http://localhost:8080/calories/admin/report')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = data.totalUsers || 0;
            document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = data.activeUsers || 0;
            document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = data.usersOverCalorieLimit || 0;
            document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = data.usersOverBudget || 0;

            const priceExceededTable = document.getElementById('priceExceededTable');
            priceExceededTable.innerHTML = '';

            if (data.usersExceedingBudget) {
                data.usersExceedingBudget.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>$${user.totalSpent.toFixed(2)}</td>
                        <td>$${(user.totalSpent - 1000).toFixed(2)}</td>
                    `;
                    priceExceededTable.appendChild(row);
                });
            }

            updateCharts(data);
        })
        .catch(error => console.error('Error updating reports:', error));
}

function updateCharts(data) {
    const activityChart = Chart.getChart('activityChart');
    if (activityChart && data.weeklyActivity) {
        activityChart.data.datasets[0].data = data.weeklyActivity;
        activityChart.update();
    }

    const weeklyChart = Chart.getChart('weeklyComparisonChart');
    if (weeklyChart && data.weeklyComparison) {
        weeklyChart.data.datasets[0].data = data.weeklyComparison.thisWeek;
        weeklyChart.data.datasets[1].data = data.weeklyComparison.lastWeek;
        weeklyChart.update();
    }

    const avgChart = Chart.getChart('averageCaloriesChart');
    if (avgChart && data.averageCaloriesPerUser) {
        const chartData = data.averageCaloriesPerUser;
        avgChart.data.labels = Object.keys(chartData);
        avgChart.data.datasets[0].data = Object.values(chartData);
        avgChart.update();
    }
}

function getAllCaloriesData(){
    fetch("http://localhost:8080/calories/data",{
        headers: {
            'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa("Admin" + ':' + "Test123!")
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
}

$(document).ready(function () {
    $("#food").on("click", function () {
        fetch("http://localhost:8080/calories/data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa("Admin" + ':' + "Test123!")
            },
        })
            .then((response) => response.json())
            .then((responseData) => {
                if (responseData) {
                    const table = $("#entriesTable").DataTable({
                        destroy: true,
                        data: responseData,
                        columns: [
                            {data: "username"},
                            {data: "foodName"},
                            {data: "calories"},
                            {data: "price", render: function (data) { return `$${data.toFixed(2)}`; }},
                            {data: "dateTime", render: function (data) { return new Date(data).toLocaleString(); }},
                            {
                                data: "id",
                                render: function (data) {
                                    return `
                                        <button class="action-btn edit-btn" data-id="${data}">Edit</button>
                                        <button class="action-btn delete-btn" data-id="${data}">Delete</button>
                                    `;
                                },
                            },
                        ],
                        lengthChange: false,
                        pageLength: 8,
                        order: [[0, "desc"]],
                        responsive: true,
                        language: {
                            search: "Search entries:",
                            lengthMenu: "Show _MENU_ entries per page",
                            info: "Showing _START_ to _END_ of _TOTAL_ entries",
                            emptyTable: "No entries found",
                        },
                        columnDefs: [{
                            targets: -1, orderable: false, searchable: false,
                        }],
                    });

                } else {
                    alert("Failed to load food entries.");
                }
            })
            .catch((error) => console.error("Error:", error));
    });
});

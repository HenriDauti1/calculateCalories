const API_CALORIES_URL = "http://localhost:8080/calories";
const API_USERS_URL = "http://localhost:8080/api";
const AUTH_HEADER = 'Basic ' + btoa("Admin:Test123!");

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    updateReports();
    initializeCharts();
    getAllCaloriesData();

    setInterval(() => {
        updateReports();
    }, 300000);
});

$(document).ready(function () {
    $("#food").on("click", function () {
        fetch("${API_CALORIES_URL}/data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${AUTH_HEADER}`,
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

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + '-section').classList.add('active');
}

function loadUsers() {
    const userTable = document.getElementById('userTable');
    fetch(`${API_USERS_URL}/users`,{
            method: 'GET',
    })
        .then(response => response.json())
        .then(users => {
            userTable.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', user.id);
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    // <td><a href="#" class="username-link" onclick="showUserCalories('${user.username}')">${user.username}</a></td>
                    <td>${user.username}</td>
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

// function makeRowEditable(button) {
//     const row = button.closest('tr');
//     const userId = row.getAttribute('data-id');
//     const cells = row.cells;
//
//     if (!row.hasAttribute('data-original')) {
//         row.setAttribute('data-original', row.innerHTML);
//     }
//
//     row.classList.add('edit-mode');
//
//     const editableFields = ['firstName', 'lastName', 'username', 'email'];
//     editableFields.forEach((field, index) => {
//         const cell = cells[index + 1];
//         const currentValue = cell.textContent;
//         cell.innerHTML = `<input type="text" name="${field}" value="${currentValue}">`;
//     });
//
//     const actionCell = cells[cells.length - 1];
//     actionCell.innerHTML = `
//         <button class="btn save-btn" onclick="saveChanges(this)">Save</button>
//         <button class="btn cancel-btn" onclick="cancelEdit(this)">Cancel</button>
//     `;
// }

// function saveChanges(button) {
//     const row = button.closest('tr');
//     const userId = row.getAttribute('data-id');
//     const inputs = row.getElementsByTagName('input');
//
//     const updatedUser = {
//         id: userId,
//         firstName: inputs[0].value,
//         lastName: inputs[1].value,
//         username: inputs[2].value,
//         email: inputs[3].value
//     };
//
//     fetch(`http://localhost:8080/api/users/${userId}`, {
//         method: 'PUT', headers: {
//             'Content-Type': 'application/json',
//         }, body: JSON.stringify(updatedUser)
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Update failed');
//             }
//             return response.json();
//         })
//         .then(data => {
//             loadUsers();
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             alert('Failed to update user');
//         });
// }

// function cancelEdit(button) {
//     const row = button.closest('tr');
//     const originalContent = row.getAttribute('data-original');
//
//     if (originalContent) {
//         row.innerHTML = originalContent;
//         row.classList.remove('edit-mode');
//         row.removeAttribute('data-original');
//     }
// }

function deleteUser(userID) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`${API_USERS_URL}/users/${userID}`, {
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
                loadUsers();
            })
            .catch(error => {
                console.error("Error:", error.message);
                alert('Failed to delete user');
            });
    }
}

// function deleteEntry(entryId, username) {
//     if (confirm('Are you sure you want to delete this entry?')) {
//         fetch(`${API_CALORIES_URL}/delete/${entryId}?username=${username}`, {
//             method: 'DELETE'
//         })
//             .then(response => {
//                 if (response.ok || response.status === 204) {
//                     // loadFoodEntries();
//                 } else {
//                     throw new Error('Failed to delete entry');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error deleting entry:', error);
//                 alert('Failed to delete entry');
//             });
//     }
// }

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
    fetch(`${API_CALORIES_URL}/user/${username}`)
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

    fetch(`${API_CALORIES_URL}/user/${username}/total-calories-week`)
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

    fetch(`${API_CALORIES_URL}/user/${username}/exceeding-2500`)
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
    const weeklyComparisonCtx = document.getElementById('weeklyComparisonChart').getContext('2d');
    new Chart(weeklyComparisonCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'This Week',
                    data: [],
                    backgroundColor: '#3b82f6'
                },
                {
                    label: 'Last Week',
                    data: [],
                    backgroundColor: '#93c5fd'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const averageCaloriesCtx = document.getElementById('averageCaloriesChart').getContext('2d');
    new Chart(averageCaloriesCtx, {
        type: 'bar',
        data: {
            labels: ['Average Calories'],
            datasets: [{
                label: 'Average Calories per User',
                data: [],
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateReports() {

    fetch(`${API_CALORIES_URL}/admin/report`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            const getDayOfWeek = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { weekday: 'long' });
            };

            const allDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            const weeklyComparisonChart = Chart.getChart('weeklyComparisonChart');
            if (weeklyComparisonChart) {
                const thisWeekData = Object.keys(data.entriesThisWeek).reduce((acc, date) => {
                    acc[getDayOfWeek(date)] = data.entriesThisWeek[date];
                    return acc;
                }, {});

                const lastWeekData = Object.keys(data.entriesLastWeek).reduce((acc, date) => {
                    acc[getDayOfWeek(date)] = data.entriesLastWeek[date];
                    return acc;
                }, {});

                const thisWeekValues = allDaysOfWeek.map(day => thisWeekData[day] || 0);
                const lastWeekValues = allDaysOfWeek.map(day => lastWeekData[day] || 0);

                weeklyComparisonChart.data.labels = allDaysOfWeek;
                weeklyComparisonChart.data.datasets[0].data = thisWeekValues;
                weeklyComparisonChart.data.datasets[1].data = lastWeekValues;
                weeklyComparisonChart.update();
            }

            const userData = data['averageCaloriesPerUser'];

            const averageCaloriesChart = Chart.getChart('averageCaloriesChart');
            if (averageCaloriesChart) {
                const labels = Object.keys(userData);
                const values = Object.values(userData);

                averageCaloriesChart.data.labels = labels;
                averageCaloriesChart.data.datasets[0].data = values;
                averageCaloriesChart.update();
            }
            const priceExceededTable = document.getElementById('priceExceededTable');
            priceExceededTable.innerHTML = '';
            data.usersExceedingMonthlyLimit.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user}</td>
                `;
                priceExceededTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error updating reports:', error));
}

function getAllCaloriesData(){
    fetch(`${API_CALORIES_URL}/data`,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${AUTH_HEADER}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
}



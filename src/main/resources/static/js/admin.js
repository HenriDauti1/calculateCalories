const API_CALORIES_URL = "http://localhost:8080/calories";
const API_USERS_URL = "http://localhost:8080/api";
const AUTH_HEADER = 'Basic ' + btoa("Admin:Test123!");
const sessionData = document.getElementById('sessionData');
const username = sessionData.getAttribute('data-username');
const role = sessionData.getAttribute('data-role');
const adminPanel = document.getElementById('adminPanel');


function logout() {
    window.location.href = "/logout";
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + '-section').classList.add('active');
}


function loadUsers() {
    fetch(`${API_USERS_URL}/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${AUTH_HEADER}`,
        },
    })
        .then((response) => response.json())
        .then((users) => {
            if (users) {
                const table = $("#userTable").DataTable({
                    destroy: true,
                    data: users,
                    dom: '<"table-header"<"table-title"<"add-button">><"search"f>>rtip',
                    columns: [
                        {data: "id"},
                        {data: "firstName"},
                        {data: "lastName"},
                        {data: "username"},
                        {data: "email"},
                        {
                            data: "id",
                            render: function (data) {
                                return `
                                    <button class="action-btn edit-btn" onclick="editUser(${data})">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="action-btn delete-btn" onclick="deleteUser(${data})">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                `;
                            },
                        },
                    ],
                    pageLength: 10,
                    order: [[0, "asc"]],
                    responsive: true,
                    language: {
                        search: "",
                        searchPlaceholder: "Search users...",
                        lengthMenu: "Show _MENU_ users per page",
                        info: "Showing _START_ to _END_ of _TOTAL_ users",
                        emptyTable: "No users found",
                    },
                    columnDefs: [
                        {
                            targets: -1,
                            orderable: false,
                            searchable: false,
                        },
                    ],
                    initComplete: function () {
                        $("div.add-button").html(`
                            <button class="add-button" onclick="addUser()">
                                <i class="fas fa-plus"></i> Add User
                            </button>
                        `);
                    }
                });
            } else {
                alert("Failed to load users.");
            }
        })
        .catch((error) => console.error("Error:", error));
}

function loadFoodEntries() {
    fetch(`${API_CALORIES_URL}/data`, {
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
                    dom: '<"table-header"<"table-title"<"add-button">><"search"f>>rtip',
                    columns: [
                        {data: "username"},
                        {data: "foodName"},
                        {data: "calories"},
                        {
                            data: "price",
                            render: function (data) {
                                return `$${data.toFixed(2)}`;
                            }
                        },
                        {
                            data: "dateTime",
                            render: function (data) {
                                return new Date(data).toLocaleString("en-GB");
                            }
                        },
                        {
                            data: null,
                            render: function (data) {
                                return `
                                    <button class="action-btn edit-btn" onclick="editEntry(${data.id}, '${data.username}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="action-btn delete-btn" onclick="deleteEntry(${data.id}, '${data.username}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                `;
                            },
                        },
                    ],
                    pageLength: 10,
                    order: [[4, "desc"]],
                    responsive: true,
                    language: {
                        search: "",
                        searchPlaceholder: "Search entries...",
                        lengthMenu: "Show _MENU_ entries per page",
                        info: "Showing _START_ to _END_ of _TOTAL_ entries",
                        emptyTable: "No entries found",
                    },
                    columnDefs: [{
                        targets: -1,
                        orderable: false,
                        searchable: false,
                    }],
                    initComplete: function () {
                        $("div.add-button").html(`
                            <button class="add-button" onclick="addEntry()">
                                <i class="fas fa-plus"></i> Add Entry
                            </button>
                        `);
                    }
                });
            } else {
                alert("Failed to load food entries.");
            }
        })
        .catch((error) => console.error("Error:", error));
}


function deleteUser(userID) {
    Swal.fire({
        title: "Are you sure you want to delete this User?",
        text: "The account will be lost forever.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, keep it",
        customClass: {
            confirmButton: 'swal-confirm-button',
            cancelButton: 'swal-cancel-button'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${API_USERS_URL}/users/${userID}`, {
                method: 'DELETE', headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `${AUTH_HEADER}`,
                },
            })
                .then((response) => {
                    if (response.ok) {
                        Swal.fire({
                            title: "User deleted successfully!", icon: "success"
                        }).then(() => {
                            loadUsers();
                        });
                    } else {
                        Swal.fire({
                            title: data.message || "An error occurred.", icon: "error"
                        });
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: "Failed to Delete User.", icon: "error"
                    });
                });
        }

    });
}

function deleteEntry(entryId, entryUsername) {
    Swal.fire({
        title: "Are you sure you want to delete this entry?",
        text: "The data will be lost forever.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, keep it",
        customClass: {
            confirmButton: 'swal-confirm-button',
            cancelButton: 'swal-cancel-button'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${API_CALORIES_URL}/delete/${entryId}?username=${entryUsername}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `${AUTH_HEADER}`
                }
            })
                .then((response) => {
                    if (response.ok || response.status === 204) {
                        Swal.fire({
                            title: "Entry deleted successfully!", icon: "success"
                        }).then(() => {
                            loadFoodEntries();
                        });

                    } else {
                        Swal.fire({
                            title: data.message || "An error occurred.", icon: "error"
                        });
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: "Failed to Delete Entry.", icon: "error"
                    });
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
                return date.toLocaleDateString('en-US', {weekday: 'long'});
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


document.addEventListener('DOMContentLoaded', () => {
    adminPanel.textContent = `Admin Panel - ${username}`;
    loadUsers();
    loadFoodEntries();
    updateReports();
    initializeCharts();
    setInterval(() => {
        updateReports();
    }, 300000);
});
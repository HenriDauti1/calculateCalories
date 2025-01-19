// URL baze per API dhe header-i i autorizimit
const API_BASE_URL = "http://localhost:8080/calories";
const AUTH_HEADER = 'Basic ' + btoa("Admin:Test123!");

// Marrja e te dhenave nga login-i
const sessionData = document.getElementById('sessionData');
const username = sessionData.getAttribute('data-username');
const role = sessionData.getAttribute('data-role');

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json', 'Authorization': AUTH_HEADER
    };
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + '-section').classList.add('active');
}
function openModal() {
    document.getElementById('modal').style.display = 'block';
}
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function addFoodEntryToUI(entry) {
    const container = document.getElementById('foodEntries');
    const div = document.createElement('div');

    let parsedEntry;
    try {
        parsedEntry = typeof entry === 'string' ? JSON.parse(entry) : entry;
    } catch (error) {
        console.error('Error parsing entry:', error);
        parsedEntry = entry;
    }

    const foodName = parsedEntry.foodName || 'N/A';
    const dateTime = parsedEntry.dateTime ? new Date(parsedEntry.dateTime) : new Date();
    const formattedDate = dateTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedTime = dateTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const calories = parsedEntry.calories !== undefined ? parsedEntry.calories : 'N/A';
    const price = parsedEntry.price !== undefined ? parsedEntry.price : 'N/A';

    div.className = 'food-entry';
    div.innerHTML = `
        <div class="food-entry-icon">
            <i class="fas fa-utensils"></i>
        </div>
        <div class="food-entry-content">
            <div class="food-entry-header">
                <h3 class="food-name">${foodName}</h3>
                <div class="food-entry-date">
                    <i class="far fa-calendar"></i> ${formattedDate}
                    <i class="far fa-clock"></i> ${formattedTime}
                </div>
            </div>
            <div class="food-entry-details">
                <div class="detail-item">
                    <i class="fas fa-fire"></i>
                    <span>${calories} calories</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-euro-sign"></i>
                    <span>${price.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    container.insertBefore(div, container.firstChild);
}

document.getElementById('foodForm').onsubmit = function (e) {
    e.preventDefault();

    const entry = {
        username: username,
        dateTime: new Date().toISOString(),
        foodName: document.getElementById('foodName').value,
        calories: parseInt(document.getElementById('calories').value),
        price: parseFloat(document.getElementById('price').value),
    };

    fetch(`${API_BASE_URL}/add?username=${entry.username}`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(entry),
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text)
                });
            }
            return response.json();
        })
        .then(data => {
            addFoodEntryToUI(data);
            calorieWarning();
            expenditureWarning();
            closeModal();
            this.reset();
        })
        .catch(error => {
            console.error('Error adding food entry:', error);
            alert('Failed to add food entry. Please check if the backend endpoint is available.');
        });
};

function filterByDate() {
    const startDate = document.getElementById('startDate').value + 'T00:00:00';
    const endDate = document.getElementById('endDate').value + 'T23:59:59';
    console.log('Filtering data by date:', startDate, endDate);

    fetch(`${API_BASE_URL}/user/${username}/filter-calories-data?fromDate=${startDate}&toDate=${endDate}`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            console.log('Filtered data:', data);

            const dates = {};
            const start = new Date(startDate);
            console.log('Start date:', start);
            const end = new Date(endDate);
            console.log('End date:', end);

            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toLocaleDateString('en-GB');
                console.log('Date string:', dateStr);
                dates[dateStr] = 0;
            }
            console.log('Dates object:', dates);

            data.forEach(entry => {
                const date = new Date(entry.dateTime).toLocaleDateString('en-GB');
                console.log('Date:', date);
                if (dates[date] !== undefined) {
                    dates[date] += entry.calories;
                }
            });

            const labels = Object.keys(dates); // 'DD/MM/YYYY'
            const caloriesData = Object.values(dates);

            const ctx = document.getElementById('customChart').getContext('2d');

            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels, // 'DD/MM/YYYY'
                    datasets: [{
                        label: 'Calories',
                        data: caloriesData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error filtering data by date:', error);
            alert('Failed to filter data. Please check the date range.');
        });
}

window.onclick = function (event) {
    if (event.target === document.getElementById('modal')) {
        closeModal();
    }
};

let chartInstance = null;
let dashInstance = null;

function getTodayCalories() {

    fetch(`${API_BASE_URL}/user/${username}`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {

            if (typeof data === 'string') {
                document.getElementById('todayCalories').innerText = '0 cal';
                document.getElementById('weeklyAverage').innerText = '0 cal';
                return;
            }
            data.forEach(entry => addFoodEntryToUI(entry));

            const today = new Date().toISOString().split('T')[0];
            const todayCalories = data
                .filter(entry => entry.dateTime.startsWith(today))
                .reduce((sum, entry) => sum + entry.calories, 0);
            document.getElementById('todayCalories').innerText = `${todayCalories} cal`;

        })
        .catch(error => {
            document.getElementById('todayCalories').innerText = '0 cal';
            document.getElementById('weeklyAverage').innerText = '0 cal';
        });
}
function getWeeklyCalories() {

    fetch(`${API_BASE_URL}/user/${username}/total-calories-week`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 404) {
                document.getElementById('weeklyAverage').innerText = '0 cal';
                return;
            }
            console.log('Weekly calories data:', data);
            const totalCalories = Object.values(data).reduce((sum, value) => sum + value, 0) / 7;
            document.getElementById('weeklyAverage').innerText = `${totalCalories.toFixed(2)} cal`;

            const dash = document.getElementById('dashboardChart').getContext('2d');

            const labels = Object.keys(data).map(date => {
                return new Date(date).toLocaleString('en-GB', {weekday: 'long'});
            }).reverse();
            const caloriesData = Object.values(data).reverse();
            if (dashInstance) {
                dashInstance.destroy();
            }
            dashInstance = new Chart(dash, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Calories',
                        data: caloriesData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching weekly calories:', error);
            alert('Failed to load weekly calories data.');
        });
}
function getTotalWeeklyExpenditure() {

    fetch(`${API_BASE_URL}/user/${username}/total-expenditure-week`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 404) {
                document.getElementById('monthlySpending').innerText = '€0.00';
                return;
            }
            console.log('Weekly expenditure data:', data);
            document.getElementById('monthlySpending').innerText = `€${data.toFixed(2)}`;
        })
        .catch(error => {
            console.error('Error fetching weekly expenditure:', error);
            alert('Failed to load weekly expenditure data.');
        });
}
function getDaysExceedingCalories() {
    fetch(`${API_BASE_URL}/user/${username}/exceed-calorie-threshold-total`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 404) {
                console.log(data.message);
                return;
            }

            const dash = document.getElementById('calorieLimitChart').getContext('2d');
            const labels = Object.keys(data).map(date => {
                return new Date(date).toLocaleString('en-GB', { weekday: 'long' });
            }).reverse();
            const caloriesData = Object.values(data).reverse();

            // Destroy existing chart instance if it exists
            if (window.dashInstance) {
                window.dashInstance.destroy();
            }

            // Create a new Chart.js instance
            window.dashInstance = new Chart(dash, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Calories',
                        data: caloriesData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching days:', error);
            alert('Failed to load calorie limit data.');
        });
}


function expenditureWarning() {
    fetch(`${API_BASE_URL}/user/${username}/spendings-exceeding-1000`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 404) {
                console.log(data.message);
                return;
            }
            console.log(data)
            const currentYearMonth = new Date().toISOString().slice(0, 7);
            const currentMonthExceeding = data[currentYearMonth];
            console.log('Current month exceeding:', currentMonthExceeding);

            if (currentMonthExceeding) {
                iziToast.warning({
                    title: 'Warning',
                    message: 'You have exceeded the monthly spending limit of €1000!',
                    position: 'topRight',
                    timeout: false,
                });
            }
        })
        .catch(error => {
            console.error('Error fetching days:', error);
            alert('Failed to load monthly spending data.');
        });
}
function calorieWarning() {
    fetch(`${API_BASE_URL}/user/${username}/exceeding-2500`, {
        headers: getAuthHeaders()
    })
        .then(response => response.text())
        .then(data => {
            if (data.status === 404) {
                console.log(data.message);
                return;
            }
            const today = new Date().toISOString().split('T')[0];
            const todayExceeding = data[today];
            if (todayExceeding) {
                iziToast.warning({
                    title: 'Warning',
                    message: 'You have exceeded the daily calorie limit of 2500!',
                    position: 'topRight',
                    timeout: false,
                });
            }
        })
        .catch(error => {
            console.error('Error fetching days:', error);
            alert('Failed to load daily calorie data.');
        });
}
getWeeklyCalories();
getTodayCalories();
getTotalWeeklyExpenditure();
getDaysExceedingCalories();
expenditureWarning();
calorieWarning();

// URL baze per API dhe header-i i autorizimit
const API_BASE_URL = "http://localhost:8080/calories";
const AUTH_HEADER = 'Basic ' + btoa("Admin:Test123!");

// Marrja e te dhenave nga login-i
const sessionData = document.getElementById('sessionData');
const username = sessionData.getAttribute('data-username');
const role = sessionData.getAttribute('data-role');

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER
    };
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');
}
//Navigimi neper faqe
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}
//Funksionet e shtimit te ushqimeve(kalorive
// )
function addFoodEntryToUI(entry) {
    const container = document.getElementById('foodEntries');
    const div = document.createElement('div');
    console.log('Entry object:', entry);

    let parsedEntry;
    try {
        parsedEntry = typeof entry === 'string' ? JSON.parse(entry) : entry;
    } catch (error) {
        console.error('Error parsing entry:', error);
        parsedEntry = entry;
    }

    const foodName = parsedEntry.foodName || 'N/A';
    const dateTime = parsedEntry.dateTime ? new Date(parsedEntry.dateTime).toLocaleDateString('en-GB') : 'Invalid Date';
    const calories = parsedEntry.calories !== undefined ? `${parsedEntry.calories} cal` : 'N/A cal';
    const price = parsedEntry.price !== undefined ? `€${parsedEntry.price}` : 'N/A';

    div.className = 'food-entry';
    div.innerHTML = `
      <div>
        <div>${foodName}</div>
        <div>${dateTime}</div>
      </div>
      <div>
        <div>${calories}</div>
        <div>${price}</div>
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
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(entry),
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
            closeModal();
            this.reset();
        })
        .catch(error => {
            console.error('Error adding food entry:', error);
            alert('Failed to add food entry. Please check if the backend endpoint is available.');
        });
};

function getCaloriesData() {
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

            // Llogaritja e kalorive ditore
            const today = new Date().toISOString().split('T')[0];
            const todayCalories = data
                .filter(entry => entry.dateTime.startsWith(today))
                .reduce((sum, entry) => sum + entry.calories, 0);

            // Llogaritja e mesatares javore te kalorive
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const weeklyData = data.filter(entry => new Date(entry.dateTime) >= oneWeekAgo);
            const weeklyAverage = weeklyData.length > 0
                ? weeklyData.reduce((sum, entry) => sum + entry.calories, 0) / 7
                : 0;

            document.getElementById('todayCalories').innerText = `${todayCalories} cal`;
            document.getElementById('weeklyAverage').innerText = `${weeklyAverage.toFixed(0)} cal`;
        })
        .catch(error => {
            console.error('Error fetching daily summary:', error);
            document.getElementById('todayCalories').innerText = '0 cal';
            document.getElementById('weeklyAverage').innerText = '0 cal';
        });

    fetch(`${API_BASE_URL}/user/${username}/spendings-exceeding-1000`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 404) {
                document.getElementById('monthlySpending').innerText = '€0.00';
                return;
            }
            console.log(data)
            const totalSpending = Object.values(data).reduce((sum, value) => sum + value, 0);
            document.getElementById('monthlySpending').innerText = `€${totalSpending.toFixed(2)}`;
        })
        .catch(error => {
            console.error('Error fetching monthly spending:', error);
            alert('Failed to load monthly spending data.');
        });
}

function filterByDate() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    //Llogaritja e kalorive per periudhen kohore te zgjedhur
    fetch(`${API_BASE_URL}/user/${username}/filter-calories-data?fromDate=${startDate}&toDate=${endDate}`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('customChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(entry => new Date(entry.dateTime).toLocaleDateString('en-GB')),
                    datasets: [{
                        label: 'Calories',
                        data: data.map(entry => entry.calories),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {position: 'top'},
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
getCaloriesData();
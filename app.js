document.getElementById('wasteForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const wasteType = document.getElementById('wasteType').value;
    const quantity = document.getElementById('quantity').value;
    const pricePerKg = document.getElementById('pricePerKg').value;
    const date = document.getElementById('date').value;
    const cost = parseFloat(quantity) * parseFloat(pricePerKg);

    const wasteData = {
        type: wasteType,
        quantity: parseFloat(quantity),
        cost: cost,
        date: date
    };

    saveWasteData(wasteData);
    displayWasteData();
    updateChart();
});

function saveWasteData(data) {
    let wasteArray = JSON.parse(localStorage.getItem('wasteData')) || [];
    wasteArray.push(data);
    localStorage.setItem('wasteData', JSON.stringify(wasteArray));
}

function displayWasteData() {
    const wasteArray = JSON.parse(localStorage.getItem('wasteData')) || [];
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    wasteArray.forEach(item => {
        let row = tableBody.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        cell1.innerHTML = item.type;
        cell2.innerHTML = item.quantity;
        cell3.innerHTML = item.cost.toFixed(2);
        cell4.innerHTML = item.date;
    });
}

function saveDataAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // First, capture the chart
    html2canvas(document.querySelector("#wasteChart")).then(canvas => {
        // Convert canvas to a data URL
        const chartDataUrl = canvas.toDataURL('image/png');

        // Add text and the chart to the PDF
        doc.setFontSize(18);
        doc.text('Food Waste Report', 14, 22);
        
        // Insert the chart image
        doc.addImage(chartDataUrl, 'PNG', 15, 30, 180, 60);  // Adjust dimensions as needed

        let y = 95; // Set the Y coordinate below the chart for text
        doc.setFontSize(11);
        doc.text("Type", 14, y);
        doc.text("Quantity (kg)", 60, y);
        doc.text("Cost (kr)", 110, y);
        doc.text("Date", 160, y);

        // Add data below the chart
        const wasteArray = JSON.parse(localStorage.getItem('wasteData')) || [];
        y += 6;
        wasteArray.forEach(item => {
            doc.text(item.type, 14, y);
            doc.text(item.quantity.toString(), 60, y);
            doc.text(item.cost.toFixed(2).toString() + ' kr', 110, y);
            doc.text(item.date, 160, y);
            y += 6;
            if (y > 280) {
                doc.addPage();
                y = 10; // Reset y position for the new page
            }
        });

        // Save the PDF
        doc.save('FoodWasteReport.pdf');
    });
}


function clearWasteData() {
    localStorage.removeItem('wasteData');
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    updateChart();
}

// Chart Initialization
var chart = null;
function updateChart() {
    const wasteArray = JSON.parse(localStorage.getItem('wasteData')) || [];
    const ctx = document.getElementById('wasteChart').getContext('2d');
    const labels = wasteArray.map(item => item.date);
    const data = wasteArray.map(item => item.cost);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cost of Waste ($)',
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayWasteData();
    updateChart();
});

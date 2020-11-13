const AddBtn = document.getElementById('AddBtn');
const KeyInput = document.getElementById('Key');
const ValueInputs = [
    document.getElementById('Value1'),
    document.getElementById('Value2')
];
const ColorInputs = [
    document.getElementById('Color1'),
    document.getElementById('Color2')
];
const chart = new Chart("myChart", {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'My Data',
            backgroundColor: [],
            data: []
        }, {
            label: 'My Other Data',
            backgroundColor: [],
            data: []
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

AddBtn.addEventListener('click', e => {
    chart.data.labels.push(KeyInput.value);
    for (let i = 0; i < ValueInputs.length; i++) {
        chart.data.datasets[i].data.push(ValueInputs[i].value);
        chart.data.datasets[i].backgroundColor.push(ColorInputs[i].value);
    }
    chart.update();
});
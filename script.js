const rgbGraphCanvas = document.getElementById('rgb_graph_canvas');
const rgbCanvas = document.getElementById('rgb_canvas');
const hslGraphCanvas = document.getElementById('hsl_graph_canvas');
const hslCanvas = document.getElementById('hsl_canvas');
const vectorInputs = document.querySelectorAll('.vector-inputs input');

let domain = 1;
let paramList = [
    { A: 0.77, B: 0.22, C: 2, D: 0.03 },
    { A: 0.5, B: 0.4, C: 1, D: 0.24 },
    { A: 0.4, B: 0.22, C: 0.93, D: 0.25 },
];
let draggingInput = null;
let initialX;
let initialVal;

vectorInputs.forEach(vectorInput => {
    vectorInput.addEventListener('mousedown', (event) => {
        draggingInput = vectorInput;
        initialX = event.clientX;
        initialVal = draggingInput.value == '' ? 0 : parseFloat(draggingInput.value);
    });
});

document.addEventListener('mousemove', (event) => {
    if (draggingInput != null) {
        const deltaX = event.clientX - initialX;
        draggingInput.value = initialVal + parseFloat(rangeLerp(deltaX, -10, 10, -0.1, 0.1, false, 3));
    }
});

document.addEventListener('mouseup', () => {
    draggingInput = null;
});

function rangeLerp(
    inputValue,
    inputRangeStart = 0,
    InputRangeEnd = 1,
    OutputRangeStart,
    OutputRangeEnd,
    capInput = false,
    decimalPlaces = 1) {
    let t = inputValue;
    if (capInput) {
        t = Math.max(Math.min(t, InputRangeEnd), inputRangeStart);
    }
    let res = OutputRangeStart * (InputRangeEnd - t) + OutputRangeEnd * (t - inputRangeStart);
    res /= (InputRangeEnd - inputRangeStart);
    return res.toFixed(decimalPlaces);
}

function colorFunc(x, params) {
    return params.A + params.B * Math.cos(2 * Math.PI * (params.C * x + params.D));
}

function updateGradient(canvas, func) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (let x = 0; x < canvas.width; x++) {
        gradient.addColorStop(x / canvas.width, func(rangeLerp(x, 0, canvas.width, 0, domain, false, 3), paramList));
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateGraph(canvas, funcList) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < funcList.length; i++) {
        for (let x = 0; x < canvas.width - 1; x++) {
            ctx.beginPath();
            ctx.strokeStyle = funcList[i]['color'](rangeLerp(x, 0, canvas.width, 0, domain, false, 3));
            ctx.moveTo(x,
                canvas.height * (1 - funcList[i]['func'](rangeLerp(x, 0, canvas.width, 0, domain, false, 3))));
            ctx.lineTo(x + 1,
                canvas.height * (1 - funcList[i]['func'](rangeLerp(x + 1, 0, canvas.width, 0, domain, false, 3))));
            ctx.stroke();
        }
    }
}

function getRGB(x, paramList) {
    const red = rangeLerp(colorFunc(x, paramList[0]), 0, 1, 0, 255, true, 3);
    const green = rangeLerp(colorFunc(x, paramList[1]), 0, 1, 0, 255, true, 3);
    const blue = rangeLerp(colorFunc(x, paramList[2]), 0, 1, 0, 255, true, 3);
    return `rgb(${red}, ${green}, ${blue})`;
}

function getHSL(x, paramList) {
    const hue = rangeLerp(colorFunc(x, paramList[0]), 0, 1, 0, 360, true, 3);
    const saturation = rangeLerp(colorFunc(x, paramList[1]), 0, 1, 0, 100, true, 3);
    const lightness = rangeLerp(colorFunc(x, paramList[2]), 0, 1, 0, 100, true, 3);
    return `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
}

updateGraph(
    rgbGraphCanvas,
    [{
        func: (x) => { return colorFunc(x, paramList[0]) },
        color: (x) => { return 'rgb(255, 20, 20)' }
    }, {
        func: (x) => { return colorFunc(x, paramList[1]) },
        color: (x) => { return 'rgb(20, 255, 20)' }
    }, {
        func: (x) => { return colorFunc(x, paramList[2]) },
        color: (x) => { return 'rgb(20, 20, 255)' }
    }]
)
updateGradient(rgbCanvas, getRGB);
updateGraph(
    hslGraphCanvas,
    [{
        func: (x) => { return colorFunc(x, paramList[0]) },
        color: (x) => { return `hsl(${360 * colorFunc(x, paramList[0])}deg, 100%, 50%)` }
    }, {
        func: (x) => { return colorFunc(x, paramList[1]) },
        color: (x) => { return `hsl(0deg, ${100 * colorFunc(x, paramList[1])}%, 50%)` }
    }, {
        func: (x) => { return colorFunc(x, paramList[2]) },
        color: (x) => { return `hsl(180deg, 100%, ${100 * colorFunc(x, paramList[2])}%)` }
    }]
)
updateGradient(hslCanvas, getHSL);
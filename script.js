const romanToArabic = (roman) => {
    const romanMap = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
    };

    const validRoman = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    if (!validRoman.test(roman)) {
        return NaN;
    }

    let arabic = 0;
    for (let i = 0; i < roman.length; i++) {
        const current = romanMap[roman[i]];
        const next = romanMap[roman[i + 1]];
        if (next && current < next) {
            arabic -= current;
        } else {
            arabic += current;
        }
    }
    return arabic;
};

const arabicToRoman = (arabic) => {
    if (arabic === 0) return 'Nulla';
    if (arabic < 0) return 'Error';

    const romanMap = [
        { value: 1000, symbol: 'M' },
        { value: 900, symbol: 'CM' },
        { value: 500, symbol: 'D' },
        { value: 400, symbol: 'CD' },
        { value: 100, symbol: 'C' },
        { value: 90, symbol: 'XC' },
        { value: 50, symbol: 'L' },
        { value: 40, symbol: 'XL' },
        { value: 10, symbol: 'X' },
        { value: 9, symbol: 'IX' },
        { value: 5, symbol: 'V' },
        { value: 4, symbol: 'IV' },
        { value: 1, symbol: 'I' }
    ];
    let roman = '';
    for (let i = 0; i < romanMap.length; i++) {
        while (arabic >= romanMap[i].value) {
            roman += romanMap[i].symbol;
            arabic -= romanMap[i].value;
        }
    }
    return roman;
};

let currentInput = '';
let operator = '';
let firstOperand = '';
let expression = '';
let calculationDone = false;
let history = [];

const updateDisplay = () => {
    document.getElementById('expression').value = expression;
    document.getElementById('result').value = currentInput;
};

const updateHistoryPanel = () => {
    const historyPanel = document.getElementById('history-panel');
    if (!historyPanel) return;

    if (!history.length) {
        historyPanel.innerHTML = '<p class="history-empty">No history yet.</p>';
        return;
    }

    const historyItems = history.map(item => `<li>${item}</li>`).join('');
    historyPanel.innerHTML = `
        <h3>History</h3>
        <ul>${historyItems}</ul>
    `;
};

const toggleHistory = () => {
    const historyPanel = document.getElementById('history-panel');
    if (!historyPanel) return;

    historyPanel.classList.toggle('visible');
    if (historyPanel.classList.contains('visible')) {
        updateHistoryPanel();
    }
};

const appendValue = (value) => {
    if (calculationDone) {
        clearDisplay();
    }
    currentInput += value;
    if (calculationDone) {
        expression = currentInput;
        calculationDone = false;
    } else {
        expression += value;
    }
    updateDisplay();
};

const appendOperator = (op) => {
    if (currentInput === '' && firstOperand === '') return;
    if (operator !== '' && currentInput !== '') calculate();

    operator = op;
    if (currentInput !== '') {
        firstOperand = currentInput;
    }
    currentInput = '';
    expression = `${firstOperand} ${op} `;
    calculationDone = false;
    updateDisplay();
};

const clearDisplay = () => {
    currentInput = '';
    operator = '';
    firstOperand = '';
    expression = '';
    calculationDone = false;
    updateDisplay();
};

const addToHistory = (entry) => {
    history.push(entry);
};

const calculate = () => {
    const firstDisplay = firstOperand;
    const secondDisplay = currentInput;
    const firstNum = romanToArabic(firstOperand);
    const secondNum = romanToArabic(currentInput);

    if (isNaN(firstNum) || isNaN(secondNum)) {
        currentInput = 'Error';
        expression += ' = Error';
        updateDisplay();
        calculationDone = true;
        addToHistory(`${firstDisplay} ${operator} ${secondDisplay} = Error`);
        const historyPanel = document.getElementById('history-panel');
        if (historyPanel && historyPanel.classList.contains('visible')) {
            updateHistoryPanel();
        }
        return;
    }

    let result;
    switch (operator) {
        case '+':
            result = firstNum + secondNum;
            break;
        case '-':
            result = firstNum - secondNum;
            break;
        case '*':
            result = firstNum * secondNum;
            break;
        case '/':
            if (secondNum === 0) {
                result = 'Error';
            } else {
                result = Math.floor(firstNum / secondNum);
            }
            break;
        default:
            result = 'Error';
    }

    const romanResult = (typeof result === 'number') ? arabicToRoman(result) : result;
    expression += ` = ${romanResult}`;
    currentInput = romanResult;
    updateDisplay();

    addToHistory(`${firstDisplay} ${operator} ${secondDisplay} = ${romanResult}`);
    const historyPanel = document.getElementById('history-panel');
    if (historyPanel && historyPanel.classList.contains('visible')) {
        updateHistoryPanel();
    }

    firstOperand = currentInput;
    currentInput = '';
    operator = '';
    calculationDone = true;
};

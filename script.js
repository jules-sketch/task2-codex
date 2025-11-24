const romanToArabic = (roman) => {
    const romanMap = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
    };

    // Regex for valid Roman numerals
    const validRoman = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    if (!validRoman.test(roman)) {
        return NaN; // Invalid Roman numeral
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

const HISTORY_KEY = 'romanCalcHistory';
let historyEntries = [];

const updateDisplay = () => {
    document.getElementById('expression').value = expression;
    document.getElementById('result').value = currentInput;
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

const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
};

const saveHistory = () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyEntries));
};

const renderHistory = () => {
    const historyList = document.getElementById('history-list');
    const emptyMessage = document.getElementById('history-empty');

    historyList.innerHTML = '';
    if (historyEntries.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    historyEntries.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'history-entry';

        const details = document.createElement('div');
        details.className = 'history-details';

        const expressionText = document.createElement('div');
        expressionText.className = 'expression';
        expressionText.textContent = `${entry.expression} = ${entry.result}`;

        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = formatTimestamp(entry.timestamp);

        details.appendChild(expressionText);
        details.appendChild(timestamp);

        const restoreButton = document.createElement('button');
        restoreButton.className = 'restore-button';
        restoreButton.textContent = 'Restore';
        restoreButton.onclick = () => restoreHistory(index);

        listItem.appendChild(details);
        listItem.appendChild(restoreButton);
        historyList.appendChild(listItem);
    });
};

const loadHistory = () => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
        historyEntries = JSON.parse(saved);
    }
    renderHistory();
};

const addHistoryEntry = (expressionText, resultText) => {
    const newEntry = {
        expression: expressionText,
        result: resultText,
        timestamp: new Date().toISOString()
    };
    historyEntries.unshift(newEntry);
    saveHistory();
    renderHistory();
};

const clearHistory = () => {
    historyEntries = [];
    saveHistory();
    renderHistory();
};

const switchTab = (tabName) => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    contents.forEach((content) => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
};

const calculate = () => {
    const secondOperand = currentInput;
    const firstNum = romanToArabic(firstOperand);
    const secondNum = romanToArabic(secondOperand);

    if (isNaN(firstNum) || isNaN(secondNum)) {
        const errorMessage = 'Error';
        expression += ' = Error';
        currentInput = errorMessage;
        updateDisplay();
        calculationDone = true;
        addHistoryEntry(`${firstOperand} ${operator} ${secondOperand}`.trim(), errorMessage);
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
    const expressionText = `${firstOperand} ${operator} ${secondOperand}`.trim();

    expression = `${expressionText} = ${romanResult}`;
    currentInput = romanResult;
    updateDisplay();

    addHistoryEntry(expressionText, romanResult);

    firstOperand = currentInput;
    currentInput = '';
    operator = '';
    calculationDone = true;
};

const restoreHistory = (index) => {
    const entry = historyEntries[index];
    if (!entry) return;

    expression = `${entry.expression} = ${entry.result}`;
    currentInput = entry.result;
    firstOperand = entry.result;
    operator = '';
    calculationDone = true;

    switchTab('calculator');
    updateDisplay();
};

window.onload = loadHistory;

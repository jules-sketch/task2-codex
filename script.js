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
let historyEntries = [];

const HISTORY_KEY = 'buddieCalculatorHistory';

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

const calculate = () => {
    if (firstOperand === '' || operator === '' || currentInput === '') {
        return;
    }

    const secondOperand = currentInput;
    const firstNum = romanToArabic(firstOperand);
    const secondNum = romanToArabic(secondOperand);

    if (isNaN(firstNum) || isNaN(secondNum)) {
        const historyEntry = `${firstOperand} ${operator} ${secondOperand} = Error`;
        expression = historyEntry;
        currentInput = 'Error';
        updateDisplay();
        addToHistory(historyEntry);
        calculationDone = true;
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
    }

    const romanResult = (typeof result === 'number') ? arabicToRoman(result) : result;
    const historyEntry = `${firstOperand} ${operator} ${secondOperand} = ${romanResult}`;
    expression = historyEntry;
    currentInput = romanResult;
    updateDisplay();

    addToHistory(historyEntry);

    firstOperand = currentInput;
    currentInput = '';
    operator = '';
    calculationDone = true;
};

const addToHistory = (entry) => {
    historyEntries.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyEntries));
    renderHistory();
};

const renderHistory = () => {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    historyList.innerHTML = '';

    if (historyEntries.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-history';
        emptyItem.textContent = 'No history yet';
        historyList.appendChild(emptyItem);
        return;
    }

    for (let i = historyEntries.length - 1; i >= 0; i--) {
        const item = document.createElement('li');
        item.textContent = historyEntries[i];
        historyList.appendChild(item);
    }
};

const toggleHistory = () => {
    const historyPanel = document.getElementById('historyPanel');
    if (!historyPanel) return;

    historyPanel.classList.toggle('visible');
};

const clearHistory = () => {
    historyEntries = [];
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
};

const loadHistory = () => {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
        try {
            historyEntries = JSON.parse(storedHistory);
        } catch (error) {
            historyEntries = [];
        }
    }
    renderHistory();
};

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

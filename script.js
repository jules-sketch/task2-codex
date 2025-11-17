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
let history = [];

const updateDisplay = () => {
    document.getElementById('expression').value = expression;
    document.getElementById('result').value = currentInput;
};

const renderHistory = () => {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (history.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'No calculations yet';
        emptyItem.classList.add('empty');
        historyList.appendChild(emptyItem);
        return;
    }

    history.forEach((entry) => {
        const listItem = document.createElement('li');
        listItem.textContent = entry;
        historyList.appendChild(listItem);
    });
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
    const firstNum = romanToArabic(firstOperand);
    const secondNum = romanToArabic(currentInput);

    if (isNaN(firstNum) || isNaN(secondNum)) {
        currentInput = 'Error';
        expression += ' = Error';
        updateDisplay();
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
    const historyEntry = `${firstOperand} ${operator} ${currentInput} = ${romanResult}`;
    expression += ` = ${romanResult}`;
    currentInput = romanResult;
    updateDisplay();

    history.unshift(historyEntry);
    renderHistory();

    firstOperand = currentInput;
    currentInput = '';
    operator = '';
    calculationDone = true;
};

const toggleHistory = () => {
    const historyContainer = document.getElementById('history');
    historyContainer.classList.toggle('hidden');
};

const clearHistory = () => {
    history = [];
    renderHistory();
};

renderHistory();

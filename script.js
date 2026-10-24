'use strict';

const expressionDisplay = document.querySelector('#expression');
const resultDisplay = document.querySelector('#result');
const keypad = document.querySelector('.keypad');

let currentInput = '0';
let previousInput = null;
let operator = null;
let shouldStartNewInput = false;
let expressionText = '';

function updateDisplay() {
  resultDisplay.textContent = currentInput;
  expressionDisplay.textContent = expressionText || (operator ? `${previousInput} ${symbolFor(operator)}` : 'Ready to calculate');
}

function symbolFor(op) {
  return ({ '+': '+', '-': '−', '*': '×', '/': '÷' })[op] || op;
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return 'Error';
  const rounded = Number.parseFloat(number.toPrecision(12));
  return String(rounded);
}

function enterNumber(number) {
  if (currentInput === 'Error' || shouldStartNewInput) {
    currentInput = number;
    shouldStartNewInput = false;
  } else if (currentInput === '0') {
    currentInput = number;
  } else if (currentInput.length < 14) {
    currentInput += number;
  }
  expressionText = '';
  updateDisplay();
}

function enterDecimal() {
  if (currentInput === 'Error' || shouldStartNewInput) {
    currentInput = '0.';
    shouldStartNewInput = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  expressionText = '';
  updateDisplay();
}

function chooseOperator(nextOperator) {
  if (currentInput === 'Error') return;
  if (operator && !shouldStartNewInput) {
    calculate();
  }
  previousInput = currentInput;
  operator = nextOperator;
  shouldStartNewInput = true;
  expressionText = `${previousInput} ${symbolFor(operator)}`;
  updateDisplay();
}

function calculate() {
  if (!operator || previousInput === null || currentInput === 'Error') return;
  const left = Number(previousInput);
  const right = Number(currentInput);
  let answer;

  switch (operator) {
    case '+': answer = left + right; break;
    case '-': answer = left - right; break;
    case '*': answer = left * right; break;
    case '/':
      if (right === 0) {
        currentInput = 'Error';
        expressionText = 'Cannot divide by zero';
        previousInput = null;
        operator = null;
        shouldStartNewInput = true;
        updateDisplay();
        return;
      }
      answer = left / right;
      break;
    default: return;
  }

  expressionText = `${previousInput} ${symbolFor(operator)} ${currentInput} =`;
  currentInput = formatNumber(answer);
  previousInput = null;
  operator = null;
  shouldStartNewInput = true;
  updateDisplay();
}

function clearCalculator() {
  currentInput = '0';
  previousInput = null;
  operator = null;
  shouldStartNewInput = false;
  expressionText = '';
  updateDisplay();
}

function deleteLast() {
  if (currentInput === 'Error' || shouldStartNewInput) {
    currentInput = '0';
    shouldStartNewInput = false;
  } else {
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
    if (currentInput === '-') currentInput = '0';
  }
  expressionText = '';
  updateDisplay();
}

function toggleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : `-${currentInput}`;
  updateDisplay();
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.number !== undefined) enterNumber(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else {
    switch (button.dataset.action) {
      case 'clear': clearCalculator(); break;
      case 'delete': deleteLast(); break;
      case 'decimal': enterDecimal(); break;
      case 'equals': calculate(); break;
      case 'sign': toggleSign(); break;
    }
  }
});

document.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) enterNumber(key);
  else if (key === '.') enterDecimal();
  else if (['+', '-', '*', '/'].includes(key)) chooseOperator(key);
  else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculate();
  } else if (key === 'Backspace') deleteLast();
  else if (key === 'Escape' || key.toLowerCase() === 'c') clearCalculator();
});

updateDisplay();

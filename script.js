class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.error = false;
    }

    delete() {
        if (this.error) {
            this.clear();
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (this.error) this.clear();
        // Prevent multiple decimals
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // If appending a number after a constant, reset it
        if (this.currentOperand === Math.PI.toString() || this.currentOperand === Math.E.toString()) {
             this.currentOperand = '';
        }
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    appendConstant(constantType) {
        if (this.error) this.clear();
        if (constantType === 'pi') {
            this.currentOperand = Math.PI.toString();
        } else if (constantType === 'e') {
            this.currentOperand = Math.E.toString();
        }
    }

    // Handles immediate mathematical functions like Sin, Cos, Log
    computeUnary(action) {
        if (this.error || this.currentOperand === '') return;
        
        let current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        let result;
        switch(action) {
            case 'sin': result = Math.sin(current); break;
            case 'cos': result = Math.cos(current); break;
            case 'tan': result = Math.tan(current); break;
            case 'log': result = Math.log10(current); break;
            case 'ln': result = Math.log(current); break;
            case 'sqrt':
                if (current < 0) {
                    this.triggerError("Invalid Input");
                    return;
                }
                result = Math.sqrt(current);
                break;
            case 'square': result = Math.pow(current, 2); break;
            default: return;
        }

        // Float precision fix
        this.currentOperand = (Math.round(result * 100000000) / 100000000).toString();
    }

    triggerError(message) {
        this.currentOperand = message;
        this.previousOperand = '';
        this.operation = undefined;
        this.error = true;
    }

    chooseOperation(operation) {
        if (this.error) this.clear();
        if (this.currentOperand === '') {
            if (this.previousOperand !== '') {
                this.operation = operation;
            }
            return;
        }
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '*': computation = prev * current; break;
            case '^': computation = Math.pow(prev, current); break;
            case '/':
                if (current === 0) {
                    this.triggerError("Cannot divide by 0");
                    return;
                }
                computation = prev / current;
                break;
            default: return;
        }

        computation = Math.round(computation * 100000000) / 100000000;
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        if (this.error || isNaN(parseFloat(number)) && number !== '' && number !== '.') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.error) {
            this.currentOperandTextElement.innerText = this.currentOperand;
            this.previousOperandTextElement.innerText = '';
            return;
        }

        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            let opSymbol = this.operation;
            if (this.operation === '*') opSymbol = '×';
            if (this.operation === '/') opSymbol = '÷';
            if (this.operation === '^') opSymbol = '^';
            
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// DOM Elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const unaryButtons = document.querySelectorAll('[data-unary]');
const constantButtons = document.querySelectorAll('[data-constant]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');
const sciToggleBtn = document.getElementById('toggle-sci');
const calculatorContainer = document.getElementById('calculator-container');

// Instantiate Calculator
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Toggle Scientific Panel
sciToggleBtn.addEventListener('click', () => {
    calculatorContainer.classList.toggle('show-scientific');
    sciToggleBtn.classList.toggle('active');
});

// Event Listeners for Standard Clicks
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operation);
        calculator.updateDisplay();
    });
});

// Event Listeners for Scientific Clicks
unaryButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.computeUnary(button.dataset.unary);
        calculator.updateDisplay();
    });
});

constantButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendConstant(button.dataset.constant);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

allClearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard Support
document.addEventListener('keydown', e => {
    let key = e.key;
    if (key === 'Enter' || key === '=') {
        e.preventDefault();
        key = 'Enter'; 
        calculator.compute();
    } else if (key === 'Escape') {
        calculator.clear();
    } else if (key === 'Backspace') {
        calculator.delete();
    } else if (/^[0-9\.]$/.test(key)) { calculator.appendNumber(key); } else if (/^[\+\-\*\/]$/.test(key) || key === '^') {
        calculator.chooseOperation(key);
    }

    calculator.updateDisplay();

    // Trigger visual active state on the corresponding button
    const btn = document.querySelector(`[data-key="${key === '=' ? 'Enter' : key}"]`);
    if (btn) btn.classList.add('pressed');
});

document.addEventListener('keyup', e => {
    let key = e.key === '=' ? 'Enter' : e.key;
    const btn = document.querySelector(`[data-key="${key}"]`);
    if (btn) btn.classList.remove('pressed');
});
class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === 'Error') {
            this.currentOperand = number.toString();
            return;
        }
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    appendConstant(constantName) {
        if (constantName === 'π') this.currentOperand = Math.PI.toString();
        else if (constantName === 'e') this.currentOperand = Math.E.toString();
        else if (constantName === 'RND') this.currentOperand = Math.random().toString();
    }

    applyMathFunction(funcName) {
        if (this.currentOperand === '' || this.currentOperand === 'Error') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;

        let result;
        // Angles are calculated in radians
        switch (funcName) {
            case 'sin': result = Math.sin(current); break;
            case 'cos': result = Math.cos(current); break;
            case 'tan': result = Math.tan(current); break;
            case 'log': result = Math.log10(current); break;
            case 'ln': result = Math.log(current); break;
            case '√': 
                if (current < 0) { result = 'Error'; }
                else { result = Math.sqrt(current); }
                break;
            case 'x²': result = Math.pow(current, 2); break;
            default: return;
        }

        if (typeof result === 'number') {
            result = Math.round(result * 10000000000) / 10000000000;
            this.currentOperand = result.toString();
        } else {
            this.currentOperand = 'Error';
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') {
            if (operation === '-') {
                 this.currentOperand = '-';
                 return;
            }
            if (this.currentOperand === '0') {
               this.previousOperand = '0';
               this.operation = operation;
               this.currentOperand = '';
               return;
            }
            return;
        }
        
        if (this.currentOperand === 'Error') return;

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
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    computation = 'Error';
                } else {
                    computation = prev / current;
                }
                break;
            case 'x^y':
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }
        
        // Handle floating point precision issues
        if (typeof computation === 'number') {
            computation = Math.round(computation * 10000000000) / 10000000000;
        }
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        if (number === '-') return '-';
        if (number === '') return '';
        
        const stringNumber = number.toString();
        // Handle scientific notation
        if (stringNumber.includes('e')) {
            const [base, exponent] = stringNumber.split('e');
            const floatBase = parseFloat(base);
            return `${floatBase.toPrecision(6)}e${exponent}`;
        }

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
        this.currentOperandTextElement.innerText = 
            this.getDisplayNumber(this.currentOperand) || (this.operation ? '' : '0');
            
        if (this.operation != null) {
            let symbol = this.operation;
            if (symbol === 'x^y') symbol = '^';
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${symbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const functionButtons = document.querySelectorAll('[data-function]');
const constantButtons = document.querySelectorAll('[data-constant]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Update display initially
calculator.updateDisplay();

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

functionButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.applyMathFunction(button.innerText);
        calculator.updateDisplay();
    });
});

constantButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendConstant(button.innerText);
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

document.addEventListener('keydown', function (event) {
    let patternForNumbers = /[0-9]/g;
    let patternForOperators = /[+\-*\/^]/g;
    
    // Ignore keypresses if modifier keys are pressed (except for combinations we might want)
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    if (event.key.match(patternForNumbers)) {
        event.preventDefault();
        calculator.appendNumber(event.key);
        calculator.updateDisplay();
    }
    if (event.key === '.') {
        event.preventDefault();
        calculator.appendNumber(event.key);
        calculator.updateDisplay();
    }
    if (event.key.match(patternForOperators)) {
        event.preventDefault();
        let operator = event.key;
        if (operator === '*') operator = '×';
        if (operator === '/') operator = '÷';
        calculator.chooseOperation(operator);
        calculator.updateDisplay();
    }
    if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (event.key === 'Backspace') {
        event.preventDefault();
        calculator.delete();
        calculator.updateDisplay();
    }
    if (event.key === 'Escape') {
        event.preventDefault();
        calculator.clear();
        calculator.updateDisplay();
    }
    
    // Keyboard shortcuts for functions and constants
    if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        calculator.appendConstant('π');
        calculator.updateDisplay();
    }
    if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        calculator.appendConstant('e');
        calculator.updateDisplay();
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const navLinks = document.querySelectorAll('nav a');
    const panels = document.querySelectorAll('.panel');
    const resultOutput = document.getElementById('result-output');
    const calculatorSection = document.getElementById('calculator-section');

    const gaussForm = document.getElementById('gauss-form');
    const bissecaoForm = document.getElementById('bissecao-form');
    const newtonForm = document.getElementById('newton-form');

    const btnSetMatrix = document.getElementById('btn-set-matrix');
    const matrixContainer = document.getElementById('gauss-matrix-container');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.id.replace('nav-', 'panel-');

            if (targetId === 'panel-bissecao' || targetId === 'panel-newton') {
                calculatorSection.style.display = 'block';
            } else {
                calculatorSection.style.display = 'none';
            }

            navLinks.forEach(l => l.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            document.getElementById(targetId).classList.add('active');
            link.classList.add('active');

            resultOutput.textContent = '';
            if (activeMathInput) {
                activeMathInput.value = '';
            }
        });
    });

    // ===========================================
    // --- Lógica da Calculadora Científica ---
    // ===========================================

    let activeMathInput = null;
    const calculator = document.getElementById('math-calculator');
    const mathInputs = document.querySelectorAll('.math-input');
    const calcButtons = calculator.querySelectorAll('.calc-btn');

    function insertAtCursor(myField, myValue) {
        if (myField.selectionStart || myField.selectionStart == '0') {
            let startPos = myField.selectionStart;
            let endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + myValue
                + myField.value.substring(endPos, myField.value.length);
            myField.selectionStart = startPos + myValue.length;
            myField.selectionEnd = startPos + myValue.length;
            myField.focus();
        } else {
            myField.value += myValue;
            myField.focus();
        }
    }

    mathInputs.forEach(input => {
        input.addEventListener('click', () => {
            activeMathInput = input;
            calculator.style.display = 'grid';
        });
    });

    calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!activeMathInput) return;
            const btnId = btn.id;
            const btnVal = btn.dataset.val;

            if (btnId === 'calc-clear') {
                activeMathInput.value = '';
                activeMathInput.focus();
            } else if (btnId === 'calc-backspace') {
                let startPos = activeMathInput.selectionStart;
                let endPos = activeMathInput.selectionEnd;
                if (startPos === endPos && startPos > 0) {
                    activeMathInput.value = activeMathInput.value.substring(0, startPos - 1) + activeMathInput.value.substring(endPos);
                    activeMathInput.selectionStart = startPos - 1;
                    activeMathInput.selectionEnd = startPos - 1;
                } else {
                    activeMathInput.value = activeMathInput.value.substring(0, startPos) + activeMathInput.value.substring(endPos);
                    activeMathInput.selectionStart = startPos;
                    activeMathInput.selectionEnd = startPos;
                }
                activeMathInput.focus();
            } else if (btnId === 'calc-close') {
                calculator.style.display = 'none';
                activeMathInput = null;
            } else if (btnVal) {
                insertAtCursor(activeMathInput, btnVal);
            }
        });
    });

    // ===========================================
    // --- "Tradutor" de Multiplicação Implícita ---
    // ===========================================
    /**
     * Corrige a sintaxe de multiplicação implícita (ex: 3x -> 3*x).
     * @param {string} str - A string de entrada (ex: "3x + (x)3")
     * @returns {string} - A string traduzida (ex: "3 * x + (x) * 3")
     */
    function parseMathString(str) {
        let parsed = str;

        // Remove espaços em branco para simplificar o regex
        parsed = parsed.replace(/\s+/g, '');

        // 1. Corrige: 3x, 3E, 3PI, 3sin, 3(, 3.14x, etc.
        // (um número) seguido por (x, E, P, s, c, t, e, l, ou '(')
        parsed = parsed.replace(/(\d+(?:\.\d+)?)(\x|E|P|s|c|t|e|l|\()/g, '$1 * $2');

        // 2. Corrige: )x, )E, )PI, )sin, )(, )3, etc.
        // (um ')') seguido por (x, E, P, s, c, t, e, l, '(', ou um número)
        parsed = parsed.replace(/(\))(\x|E|P|s|c|t|e|l|\(|\d)/g, '$1 * $2');

        // 3. Corrige: x3, E3, PI3, x(, E(, PI(
        // (x, E, ou PI) seguido por (um número ou '(')
        parsed = parsed.replace(/(x|E|PI)(\d|\()/g, '$1 * $2');

        return parsed;
    }

    // ===========================================
    // --- Lógica da Eliminação de Gauss ---
    // ===========================================

    btnSetMatrix.addEventListener('click', () => {
        const n = parseInt(document.getElementById('gauss-n').value);
        if (n < 2 || n > 10) { alert("Por favor, insira um N entre 2 e 10."); return; }
        matrixContainer.innerHTML = '';
        let grid = document.createElement('div');
        grid.id = 'gauss-matrix-inputs';
        grid.style.gridTemplateColumns = `repeat(${n}, 60px) 20px 60px`;
        grid.innerHTML += `<span></span>`.repeat(n + 2);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                grid.innerHTML += `<input type="number" id="A-${i}-${j}" step="any" required>`;
            }
            grid.innerHTML += `<span> | </span>`;
            grid.innerHTML += `<input type="number" id="b-${i}" step="any" required>`;
        }
        matrixContainer.appendChild(grid);
    });

    function retroSubstituicao(A, b) {
        const n = A.length;
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let soma = 0;
            for (let j = i + 1; j < n; j++) {
                soma += A[i][j] * x[j];
            }
            if (Math.abs(A[i][i]) < 1e-10) {
                 throw new Error("Divisão por zero na retrosubstituição. Sistema pode ser singular.");
            }
            x[i] = (b[i] - soma) / A[i][i];
        }
        return x;
    }

    gaussForm.addEventListener('submit', (e) => {
        e.preventDefault();
        resultOutput.textContent = '';
        const resultContainer = document.getElementById('result-container');
        const resultHeader = document.querySelector('.result-header');

        resultContainer.classList.remove('result-celebration');
        resultHeader.classList.remove('result-success');

        try {
            const n = parseInt(document.getElementById('gauss-n').value);
            let A = Array(n).fill(0).map(() => Array(n).fill(0));
            let b = Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const val = parseFloat(document.getElementById(`A-${i}-${j}`).value);
                    if (isNaN(val)) throw new Error(`Valor inválido em A[${i}][${j}]`);
                    A[i][j] = val;
                }
                const valB = parseFloat(document.getElementById(`b-${i}`).value);
                if (isNaN(valB)) throw new Error(`Valor inválido em b[${i}]`);
                b[i] = valB;
            }
            eliminacaoGaussianaPivoteamento(A, b); //
            const solucao_x = retroSubstituicao(A, b);

            let resultStr = "✨ SOLUÇÃO DO SISTEMA LINEAR, PRA VOCÊ, MINHA GATA! 💕\n";
            resultStr += "═".repeat(40) + "\n\n";
            resultStr += "🎯 Vetor Solução (x):\n\n";

            solucao_x.forEach((val, i) => {
                resultStr += `💖 x[${i}] = ${val.toFixed(6)}\n`;
            });

            resultStr += "\n" + "═".repeat(40) + "\n";
            resultStr += "✅ Sistema resolvido com sucesso, bebê! 💖";

            resultOutput.textContent = resultStr;

            setTimeout(() => {
                resultContainer.classList.add('result-celebration');
                resultHeader.classList.add('result-success');
            }, 100);

        } catch (error) {
            resultOutput.textContent = `❌ ERRO:\n${error.message}\n\n💡 Verifique os valores inseridos e tente novamente! 💕`;
        }
    });

    // ===========================================
    // --- Lógica da Bisseção---
    // ===========================================

    bissecaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resultContainer = document.getElementById('result-container');
        const resultHeader = document.querySelector('.result-header');

        resultContainer.classList.remove('result-celebration');
        resultHeader.classList.remove('result-success');

        try {
            const f_str_raw = activeMathInput.value;
            const f_str = parseMathString(f_str_raw);

            const xl = parseFloat(document.getElementById('bissecao-xl').value);
            const xu = parseFloat(document.getElementById('bissecao-xu').value);
            const es = parseFloat(document.getElementById('bissecao-es').value);
            const imax = parseInt(document.getElementById('bissecao-imax').value);

            resultOutput.textContent = `🔍 Analisando função: ${f_str}\n\n⏳ Calculando raiz pelo método da bisseção...`;

            const f = new Function('x', `with(Math) { return ${f_str}; }`);

            const resultado = bissecao(f, xl, xu, es, imax); //

            let resultStr = "✨ MÉTODO DA BISSEÇÃO ✨\n";
            resultStr += "═".repeat(45) + "\n\n";
            resultStr += `📊 Função interpretada: ${f_str}\n\n`;

            if (resultado.message) {
                resultStr += `❌ ${resultado.message}\n\n`;
                resultStr += "💡 Dica: Verifique se f(xl) e f(xu) têm sinais opostos! 💕";
            } else {
                resultStr += "🎯 RESULTADO ENCONTRADO:\n\n";
                resultStr += `💎 Raiz aproximada: ${resultado.root.toFixed(8)}\n`;
                resultStr += `📈 Erro relativo: ${resultado.error.toFixed(6)}%\n`;
                resultStr += `🔄 Iterações realizadas: ${resultado.iterations}\n\n`;
                resultStr += "═".repeat(45) + "\n";
                resultStr += "✅ Método executado com sucesso! 💖";

                setTimeout(() => {
                    resultContainer.classList.add('result-celebration');
                    resultHeader.classList.add('result-success');
                }, 100);
            }

            resultOutput.textContent = resultStr;
        } catch (error) {
             resultOutput.textContent = `❌ ERRO:\n${error.message}\n\n💡 Verifique a função e os parâmetros inseridos! 💕`;
        }
    });

    // ===========================================
    // --- Lógica de Newton-Raphson ---
    // ===========================================

    newtonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resultContainer = document.getElementById('result-container');
        const resultHeader = document.querySelector('.result-header');

        resultContainer.classList.remove('result-celebration');
        resultHeader.classList.remove('result-success');

        let f_str_js, fprime_str_js;

        try {

            const f_str_raw = activeMathInput.value;
            if (!f_str_raw) throw new Error("A função f(x) não pode estar vazia.");

            f_str_js = parseMathString(f_str_raw);

            let f_str_mathjs = f_str_js
                                .replace(/\*\*/g, '^')
                                .replace(/\bE\b/g, 'e')
                                .replace(/\bPI\b/g, 'pi');

            const derivativeNode = math.derivative(f_str_mathjs, 'x');

            let fprime_str_mathjs = derivativeNode.toString();

            fprime_str_js = fprime_str_mathjs
                                .replace(/\^/g, '**')
                                .replace(/\be\b/g, 'E')
                                .replace(/\bpi\b/g, 'PI');

            const x0 = parseFloat(document.getElementById('newton-x0').value);
            const es = parseFloat(document.getElementById('newton-es').value);
            const imax = parseInt(document.getElementById('newton-imax').value);

            resultOutput.textContent = `🔍 Função f(x): ${f_str_js}\n🧮 Derivada f'(x): ${fprime_str_js}\n\n⏳ Calculando pelo método de Newton-Raphson...`;

            const f = new Function('x', `with(Math) { return ${f_str_js}; }`);
            const fPrime = new Function('x', `with(Math) { return ${fprime_str_js}; }`);

            const resultado = newtonRaphson(f, fPrime, x0, es, imax);

            let resultStr = "✨ MÉTODO DE NEWTON-RAPHSON ✨\n";
            resultStr += "═".repeat(50) + "\n\n";
            resultStr += `📊 Função f(x): ${f_str_js}\n`;
            resultStr += `🧮 Derivada f'(x): ${fprime_str_js}\n\n`;

            if (resultado.message) {
                resultStr += `❌ ${resultado.message}\n\n`;
                resultStr += "💡 Dica: Tente um chute inicial diferente ou verifique se a derivada não é zero! 💕";
            } else {
                resultStr += "🎯 RESULTADO ENCONTRADO:\n\n";
                resultStr += `💎 Raiz aproximada: ${resultado.root.toFixed(8)}\n`;
                resultStr += `📈 Erro relativo: ${resultado.error.toFixed(6)}%\n`;
                resultStr += `🔄 Iterações realizadas: ${resultado.iterations}\n\n`;
                resultStr += "═".repeat(50) + "\n";
                resultStr += "✅ Método executado com sucesso! 💖";

                setTimeout(() => {
                    resultContainer.classList.add('result-celebration');
                    resultHeader.classList.add('result-success');
                }, 100);
            }

            resultOutput.textContent = resultStr;

        } catch (error) {
            resultOutput.textContent = `❌ ERRO:\n${error.message}\n\n💡 Verifique a função e os parâmetros inseridos! 💕`;
        }
    });

    btnSetMatrix.click(); 
});
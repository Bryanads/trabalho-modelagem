// Aguarda o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores dos Elementos ---
    const navLinks = document.querySelectorAll('nav a');
    const panels = document.querySelectorAll('.panel');
    const resultOutput = document.getElementById('result-output');

    // --- Seletores dos Formulários ---
    const gaussForm = document.getElementById('gauss-form');
    const bissecaoForm = document.getElementById('bissecao-form');
    const newtonForm = document.getElementById('newton-form');

    // --- Seletores de Gauss ---
    const btnSetMatrix = document.getElementById('btn-set-matrix');
    const matrixContainer = document.getElementById('gauss-matrix-container');

    // --- Lógica de Navegação por Abas ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            const targetId = link.id.replace('nav-', 'panel-');
            document.getElementById(targetId).classList.add('active');
            link.classList.add('active');
            resultOutput.textContent = '';
            calculator.style.display = 'none';
            activeMathInput = null;
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
    // --- "Tradutor" de Multiplicação Implícita (DE VOLTA!) ---
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
            let resultStr = "Solução (Vetor x):\n\n";
            solucao_x.forEach((val, i) => {
                resultStr += `x[${i}] = ${val.toFixed(6)}\n`;
            });
            resultOutput.textContent = resultStr;
        } catch (error) {
            resultOutput.textContent = `Erro: ${error.message}`;
        }
    });

    // ===========================================
    // --- Lógica da Bisseção (ATUALIZADA) ---
    // ===========================================

    bissecaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            // 1. Pega a string "crua"
            const f_str_raw = document.getElementById('bissecao-f').value;
            // 2. *** PASSA PELO PARSER ***
            const f_str = parseMathString(f_str_raw);

            const xl = parseFloat(document.getElementById('bissecao-xl').value);
            const xu = parseFloat(document.getElementById('bissecao-xu').value);
            const es = parseFloat(document.getElementById('bissecao-es').value);
            const imax = parseInt(document.getElementById('bissecao-imax').value);

            resultOutput.textContent = `Função interpretada: ${f_str}\n\nCalculando...`;

            const f = new Function('x', `with(Math) { return ${f_str}; }`);

            const resultado = bissecao(f, xl, xu, es, imax); //

            resultOutput.textContent = `Função interpretada: ${f_str}\n\n` +
                                     `Resultado:\n${JSON.stringify(resultado, null, 2)}`;
        } catch (error) {
             resultOutput.textContent = `Erro ao avaliar a função ou executar o método:\n${error.message}`;
        }
    });

    // ===========================================
    // --- Lógica de Newton-Raphson (ATUALIZADA) ---
    // ===========================================

    newtonForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let f_str_js, fprime_str_js;

        try {
            // 1. Pega a string "crua" da calculadora
            // Ex: (E**x)-3x
            const f_str_raw = document.getElementById('newton-f').value;
            if (!f_str_raw) throw new Error("A função f(x) não pode estar vazia.");

            // 2. *** PASSA PELO PARSER *** (O PASSO QUE FALTAVA)
            // Ex: (E**x) - 3 * x
            f_str_js = parseMathString(f_str_raw);

            // 3. Traduz a string JS (corrigida) para a sintaxe do math.js
            // Ex: (e^x) - 3 * x
            let f_str_mathjs = f_str_js
                                .replace(/\*\*/g, '^')  // Troca ** por ^
                                .replace(/\bE\b/g, 'e')   // Troca E (constante) por e
                                .replace(/\bPI\b/g, 'pi'); // Troca PI por pi

            // 4. Calcula a derivada usando math.js (AGORA VAI FUNCIONAR)
            const derivativeNode = math.derivative(f_str_mathjs, 'x');

            // 5. Converte a derivada de volta para string (sintaxe math.js)
            // Ex: exp(x) - 3
            let fprime_str_mathjs = derivativeNode.toString();

            // 6. Traduz a string da derivada de volta para sintaxe JS
            // Ex: exp(x) - 3  ->  Math.exp(x) - 3 (ou apenas exp(x) - 3)
            fprime_str_js = fprime_str_mathjs
                                .replace(/\^/g, '**') // Troca ^ por **
                                .replace(/\be\b/g, 'E')  // Troca e por E
                                .replace(/\bpi\b/g, 'PI'); // Troca pi por PI

            // --- Continua como antes ---

            const x0 = parseFloat(document.getElementById('newton-x0').value);
            const es = parseFloat(document.getElementById('newton-es').value);
            const imax = parseInt(document.getElementById('newton-imax').value);

            resultOutput.textContent = `Função f(x) interpretada: ${f_str_js}\n` +
                                     `Derivada f'(x) calculada: ${fprime_str_js}\n\nCalculando...`;

            // Cria as duas funções
            const f = new Function('x', `with(Math) { return ${f_str_js}; }`);
            const fPrime = new Function('x', `with(Math) { return ${fprime_str_js}; }`);

            // Chama a função original do newton.js
            const resultado = newtonRaphson(f, fPrime, x0, es, imax);

            resultOutput.textContent = `Função f(x) interpretada: ${f_str_js}\n` +
                                     `Derivada f'(x) calculada: ${fprime_str_js}\n\n` +
                                     `Resultado:\n${JSON.stringify(resultado, null, 2)}`;

        } catch (error) {
            resultOutput.textContent = `Erro ao derivar ou avaliar a função:\n${error.message}`;
        }
    });

    // --- Inicialização ---
    btnSetMatrix.click(); // Gera a matriz 3x3 inicial para Gauss
});
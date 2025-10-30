/**
 * Encontra a raiz de uma função pelo Método de Newton-Raphson.
 *
 * @param {function(number): number} f - A função para a qual queremos encontrar a raiz.
 * @param {function(number): number} fPrime - A DERIVADA da função f.
 * @param {number} x0 - A estimativa inicial (chute inicial).
 * @param {number} es - O critério de parada do erro relativo (em porcentagem, ex: 0.5).
 * @param {number} imax - O número máximo de iterações.
 * @returns {object} - Um objeto contendo a raiz, o erro e as iterações.
 */
function newtonRaphson(f, fPrime, x0, es, imax) {

    // Tradução de: xr = x0
    let xr = x0;

    // Tradução de: iter = 0
    let iter = 0;

    let xrold;
    let ea = 100; // Inicia o erro alto para garantir a entrada no loop

    // Tradução de: DO ... END DO
    do {
        // xrold = xr
        xrold = xr;

        // --- Cálculo principal de Newton-Raphson ---
        const fVal = f(xrold);
        const fPrimeVal = fPrime(xrold);

        // Verificação de segurança: Evita divisão por zero
        if (Math.abs(fPrimeVal) < 1e-10) { // 1e-10 é uma tolerância pequena
             return {
                 root: null,
                 error: null,
                 iterations: iter,
                 message: "Erro: Derivada próxima de zero (f'(x) = 0). O método falhou."
             };
        }

        // xr = xrold - f(xrold) / f'(xrold)
        xr = xrold - (fVal / fPrimeVal);

        // iter = iter + 1
        iter++;

        // IF xr != 0 THEN ... END IF
        if (xr !== 0) {
            ea = Math.abs((xr - xrold) / xr) * 100;
        }
        // Nota: Se xr for 0, o pseudocódigo original não atualiza 'ea'.
        // O loop pode continuar até 'imax'.

        // A condição de SAÍDA do pseudocódigo é: (ea < es OR iter >= imax)
        // Portanto, a condição de CONTINUAÇÃO do 'while' é o oposto:
        // (ea >= es AND iter < imax)

    } while (ea >= es && iter < imax);
    // Fim do: END DO

    // Fixpt = xr
    return { root: xr, error: ea, iterations: iter };
}
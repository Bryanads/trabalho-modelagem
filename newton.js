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

    let xr = x0;

    let iter = 0;

    let xrold;
    let ea = 100; // Inicia o erro alto para garantir a entrada no loop

    do {
        xrold = xr;

        const fVal = f(xrold);
        const fPrimeVal = fPrime(xrold);

        if (Math.abs(fPrimeVal) < 1e-10) {
             return {
                 root: null,
                 error: null,
                 iterations: iter,
                 message: "Erro: Derivada próxima de zero (f'(x) = 0). O método falhou."
             };
        }

        xr = xrold - (fVal / fPrimeVal);

        iter++;

        if (xr !== 0) {
            ea = Math.abs((xr - xrold) / xr) * 100;
        }


    } while (ea >= es && iter < imax);

    return { root: xr, error: ea, iterations: iter };
}
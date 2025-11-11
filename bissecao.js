/**
 * Encontra a raiz de uma função pelo Método da Bisseção.
 *
 * @param {function(number): number} f - A função para a qual queremos encontrar a raiz (ex: x => x**2 - 4).
 * @param {number} xl - O limite inferior do intervalo (deve ter sinal oposto de f(xu)).
 * @param {number} xu - O limite superior do intervalo (deve ter sinal oposto de f(xl)).
 * @param {number} es - O critério de parada do erro relativo (em porcentagem, ex: 0.5).
 * @param {number} imax - O número máximo de iterações.
 * @returns {object} - Um objeto contendo a raiz, o erro e as iterações.
 */
function bissecao(f, xl, xu, es, imax) {

    if (f(xl) * f(xu) >= 0) {
        return {
            root: null,
            error: null,
            iterations: 0,
            message: "Erro: f(xl) e f(xu) devem ter sinais opostos."
        };
    }

    let iter = 0;
    let xr = xl;
    let xrold;
    let ea = 100;

    do {
        xrold = xr;

        xr = (xl + xu) / 2;

        iter++;

        if (xr !== 0) {
            ea = Math.abs((xr - xrold) / xr) * 100;
        }

        const test = f(xl) * f(xr);

        if (test < 0) {
            xu = xr;
        }

        else if (test > 0) {
            xl = xr;
        }
        else {
            ea = 0;
        }

    } while (ea >= es && iter < imax);

    return { root: xr, error: ea, iterations: iter };
}
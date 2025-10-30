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

    // Verificação inicial: O método só funciona se f(xl) e f(xu) tiverem sinais opostos.
    if (f(xl) * f(xu) >= 0) {
        return {
            root: null,
            error: null,
            iterations: 0,
            message: "Erro: f(xl) e f(xu) devem ter sinais opostos."
        };
    }

    // Tradução de: FUNCTION Bisseccao(...)
    let iter = 0;
    let xr = xl; // Inicializa xr para que 'xrold' tenha um valor na 1ª iteração
    let xrold;
    let ea = 100; // Inicia o erro alto para garantir a entrada no loop

    // Tradução de: DO ... END DO
    do {
        // xrold = xr
        xrold = xr;

        // xr = (xl + xu) / 2
        xr = (xl + xu) / 2;

        // iter = iter + 1
        iter++;

        // IF xr != 0 THEN ... END IF
        if (xr !== 0) {
            ea = Math.abs((xr - xrold) / xr) * 100;
        }

        // test = f(xl) * f(xr)
        const test = f(xl) * f(xr);

        // IF test < 0 THEN ...
        if (test < 0) {
            xu = xr; // A raiz está no sub-intervalo esquerdo
        }
        // ELSE IF test > 0 THEN ...
        else if (test > 0) {
            xl = xr; // A raiz está no sub-intervalo direito
        }
        // ELSE
        else {
            ea = 0; // Encontramos a raiz exata
        }

        // A condição de SAÍDA do pseudocódigo é: (ea < es OR iter >= imax)
        // Portanto, a condição de CONTINUAÇÃO do 'while' é o oposto:
        // (ea >= es AND iter < imax)

    } while (ea >= es && iter < imax);
    // Fim do: END DO

    // Bisseccao = xr
    return { root: xr, error: ea, iterations: iter };
}
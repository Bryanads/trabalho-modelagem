/**
 * FASE 1: Executa a eliminação de Gauss com PIVOTEAMENTO PARCIAL.
 * Modifica A e b "in-place".
 *
 * @param {number[][]} A - A matriz (N x N) do sistema.
 * @param {number[]} b - O vetor (N x 1) de termos independentes.
 */
function eliminacaoGaussianaPivoteamento(A, b) {
    const n = A.length;
    const epsilon = 1e-10; // Uma tolerância pequena para evitar problemas com ponto flutuante

    for (let k = 0; k < n - 1; k++) {

        // --- INÍCIO DO PIVOTEAMENTO PARCIAL ---

        // 1. Encontrar a linha com o maior pivô (em módulo)
        let maxLinha = k;
        let maxVal = Math.abs(A[k][k]);

        for (let i = k + 1; i < n; i++) {
            let absVal = Math.abs(A[i][k]);
            if (absVal > maxVal) {
                maxVal = absVal;
                maxLinha = i;
            }
        }

        // 2. Verificar se a matriz é singular (pivô é zero)
        if (maxVal < epsilon) {
            // Não há pivô não-zero. A matriz é singular.
            throw new Error("Matriz singular, o sistema pode não ter solução única.");
        }

        // 3. Trocar a linha 'k' atual com a 'maxLinha' (se forem diferentes)
        if (maxLinha !== k) {
            // Troca as linhas na matriz A
            [A[k], A[maxLinha]] = [A[maxLinha], A[k]];

            // IMPORTANTE: Troca também os elementos no vetor b
            [b[k], b[maxLinha]] = [b[maxLinha], b[k]];
        }

        // --- FIM DO PIVOTEAMENTO ---

        // Agora, A[k][k] é o maior pivô e podemos continuar a eliminação.

        for (let i = k + 1; i < n; i++) {

            // Esta divisão agora é segura, pois A[k][k] é o maior pivô
            // e sabemos que não é zero (devido à verificação acima).
            const fator = A[i][k] / A[k][k];

            for (let j = k + 1; j < n; j++) {
                A[i][j] = A[i][j] - fator * A[k][j];
            }
            b[i] = b[i] - fator * b[k];
            A[i][k] = 0; // Zerando explicitamente
        }
    }
}
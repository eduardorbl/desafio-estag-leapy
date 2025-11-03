import sys, json

def min_coins(coins, amount):
    if amount == 0: return 0
    if not coins or amount < 0: return -1

    INF = amount + 1 # infinito seguro para mostrar números impossíveis de atingir
    prog_din = [0] + [INF] * amount
    # prog_din vem de programacao dinamica: 
    # a ideia é fazer um loop onde prog_din garante que:
    # digamos que já calculamos prog_din[0:i] significa que podemos chegar em prog_din[i+1] fazendo:
    # prog_din[i+1] = 1 + min(prog_din[i+1 - j]) para todo j entre 0 e i

    for i in range(1, amount+1):
        best = INF
        for c in coins:
            if c <= i:
                candidato = prog_din[i - c] + 1
                if candidato < best: best = candidato
        
        prog_din[i] = best

    return prog_din[amount] if prog_din[amount] != INF else -1

def main():
    try:
        data = json.load(sys.stdin)
        coins = data.get("coins")
        amount = data.get("amount")

        # Validação mínima de contrato
        if not isinstance(coins, list) or not isinstance(amount, int):
            # Falha de contrato => devolve -1 (sem ruído no stdout)
            result = -1
        else:
            result = min_coins(coins, amount)

        # Saída estritamente conforme contrato
        json.dump({"minCoins": result}, sys.stdout, separators=(",", ":"))
        # Opcional: newline no final (não quebra parsers)
        sys.stdout.write("\n")
    except Exception:
        # Em caso de erro inesperado de parsing, mantém contrato
        json.dump({"minCoins": -1}, sys.stdout, separators=(",", ":"))
        sys.stdout.write("\n")

if __name__ == "__main__":
    main()
 # Gestor de Estoque (Simples)

 Interface simples em HTML/CSS/JS para gerenciar produtos com entrada/saída, vendas e relatórios.

 ## Como usar

 - Abra `index.html` no seu navegador (duplo-clique ou `file://...`).

 - Campos:
   - `Nome` — nome do produto.
   - `Preço (R$)` — preço unitário em reais.
   - `Quantidade` — quantidade a adicionar.

 - Botões:
   - `Adicionar / Entrar` — cria ou acrescenta ao produto existente.
   - `+ Entrada` — adicionar quantidade a um produto existente.
   - `Vender` — registra venda e reduz o estoque; atualiza "Valor já vendido".
   - `Remover` — remove o produto do catálogo.
   - `Limpar dados` — remove tudo do `localStorage`.

 ## Observações

 - Os dados são salvos no `localStorage` do navegador e persistem entre recargas.

 - Projeto minimalista: ideal para testes locais e pequenas necessidades.

 ## Execução (linha de comando)

 - Servir localmente (opcional):

 ```bash
 # com Python 3
 python3 -m http.server 8000
 # abrir http://localhost:8000
 ```

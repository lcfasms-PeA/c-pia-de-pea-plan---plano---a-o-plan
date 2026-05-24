$directories = @('docs', 'src')
$files = @('docs/1-definicao_projeto.txt', 'docs/2-requisitos_funcionais.txt', 'docs/3-arquitetura_sistema.txt', 'docs/4-instalacao_ambiente.txt', 'docs/5-configuracao_banco_dados.txt', 'docs/6-estrutura_pastas.txt', 'src/7-cliente.py', 'src/8-autenticacao.py', 'src/9-logica_adicao.py', 'src/10-usuario.py', 'docs/11-interface_grafica.txt', 'src/12-testes_cliente.py', 'docs/13-cronograma_lancamento.txt', 'docs/14-consideracoes_legais.txt', 'docs/15-conclusao.txt')

foreach ($dir in $directories) { if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null } }
foreach ($file in $files) { if (-not (Test-Path $file)) { New-Item -ItemType File -Path $file -Force | Out-Null; Write-Output "Arquivo criado: $file" } }
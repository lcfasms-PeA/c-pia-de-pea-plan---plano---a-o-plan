import importlib.util
import os
import sys

def carregar_modulo_local(nome_modulo, caminho_relativo):
    caminho_absoluto = os.path.abspath(caminho_relativo)
    spec = importlib.util.spec_from_file_location(nome_modulo, caminho_absoluto)
    if spec and spec.loader:
        modulo = importlib.util.module_from_spec(spec)
        sys.modules[nome_modulo] = modulo
        spec.loader.exec_module(modulo)
        return modulo
    raise ImportError(f"Erro ao carregar: {caminho_relativo}")

try:
    print("🟢 [AUDITORIA]: Indexando modulos locais...")
    modulo_7 = carregar_modulo_local("cliente_modulo", "src/7-cliente.py")
    modulo_8 = carregar_modulo_local("auth_modulo", "src/8-autenticacao.py")
    modulo_9 = carregar_modulo_local("logica_modulo", "src/9-logica_adicao.py")

    Endereco = modulo_7.Endereco
    DocumentoID = modulo_7.DocumentoID
    LogicaAdicao = modulo_9.LogicaAdicao

    # Instancia a logica do sistema
    logica_sistema = LogicaAdicao()

    # Cria objetos com os parametros obrigatorios corretos da Parte 7
    endereco_teste = Endereco(rua="Main St", numero="123", codigo_postal="12345", cidade="Test City", estado="TS", pais="PT")
    documento_teste = DocumentoID(tipo="Passaporte", numero="BR999888")

    print("⏳ [PROCESSANDO]: Executando cadastro integrado no banco de dados local...")
    
    # Executa a funcao de cadastro
    cadastro_realizado = logica_sistema.cadastrar_cliente(
        email="test@example.com",
        senha="senhaCripto123",
        nome="John Doe",
        telefone="+1234567890",
        endereco=endereco_teste,
        documento=documento_teste
    )

    if cadastro_realizado:
        print("🏆 [SUCESSO TOTAL]: O teste integrado rodou e validou as partes 7, 8 e 9!")
    else:
        print("❌ [FALHA]: O cadastro retornou um erro de validacao interna.")

except Exception as e:
    print(f"🚨 [ERRO DE EXECUÇÃO]: {e}")

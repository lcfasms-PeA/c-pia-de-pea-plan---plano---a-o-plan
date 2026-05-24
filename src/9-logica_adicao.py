import re
from importlib.util import spec_from_file_location, module_from_spec
import sys
import os

# Carrega os módulos numerados dinamicamente via caminhos relativos
spec_cliente = spec_from_file_location("cliente_modulo", "src/7-cliente.py")
modulo_cliente = module_from_spec(spec_cliente)
spec_cliente.loader.exec_module(modulo_cliente)

Cliente = modulo_cliente.Cliente
Endereco = modulo_cliente.Endereco
DocumentoID = modulo_cliente.DocumentoID

spec_auth = spec_from_file_location("auth_modulo", "src/8-autenticacao.py")
modulo_auth = module_from_spec(spec_auth)
spec_auth.loader.exec_module(modulo_auth)

AutenticacaoComLimiter = modulo_auth.AutenticacaoComLimiter


class LogicaAdicao:
    """Classe orquestradora que gerencia o cadastro seguro de novos clientes."""
    def __init__(self):
        self.clientes = {}
        self.autenticacao = AutenticacaoComLimiter()

    def cadastrar_cliente(self, email: str, senha: str, nome: str, telefone: str, endereco: Endereco, documento: DocumentoID) -> bool:
        try:
            if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email):
                raise ValueError("Formato de e-mail inválido.")

            email_chave = email.lower().strip()
            if email_chave in self.clientes:
                raise ValueError("E-mail já cadastrado.")

            if not all([email_chave, senha, nome, telefone]):
                raise ValueError("Campos obrigatórios ausentes.")

            # Instancia o objeto completo da Parte 7
            novo_cliente = Cliente(
                id_cliente=len(self.clientes) + 1,
                nome=nome,
                email=email_chave,
                telefone=telefone,
                endereco=endereco,
                documento=documento
            )
            
            # Criptografa na camada da Parte 8
            self.autenticacao.cadastrar_usuario(email_chave, senha)
            self.clientes[email_chave] = novo_cliente
            return True

        except Exception as e:
            return False

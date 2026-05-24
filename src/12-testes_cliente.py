import unittest
import importlib.util
import os
import sys

def carregar_modulo_local(nome_modulo, caminho_relativo):
    """Carrega com segurança arquivos numerados com hífens no Windows 11."""
    caminho_absoluto = os.path.abspath(caminho_relativo)
    spec = importlib.util.spec_from_file_location(nome_modulo, caminho_absoluto)
    if spec and spec.loader:
        modulo = importlib.util.module_from_spec(spec)
        sys.modules[nome_modulo] = modulo
        spec.loader.exec_module(modulo)
        return modulo
    raise ImportError(f"Erro ao carregar modulo: {caminho_relativo}")

class TesteCliente(unittest.TestCase):
    """Executa auditoria de testes unitários defensivos integrados com a Parte 7."""
    
    @classmethod
    def setUpClass(cls):
        # Carrega o arquivo real da Parte 7 do seu HD
        cls.modulo_7 = carregar_modulo_local("cliente_modulo", "src/7-cliente.py")
        cls.Cliente = cls.modulo_7.Cliente
        cls.Endereco = cls.modulo_7.Endereco
        cls.DocumentoID = cls.modulo_7.DocumentoID

    def test_01_cadastro_sucesso(self):
        """Valida se as classes aceitam dados internacionais estruturados corretamente."""
        end = self.Endereco("Main St", "123", "12345", "Test City", "TS", "US")
        doc = self.DocumentoID("Passaporte", "US123456")
        cliente = self.Cliente(1, "John Doe", "john@example.com", "+1234567890", end, doc)
        self.assertEqual(cliente.nome, "John Doe")
        self.assertEqual(cliente.email, "john@example.com")

    def test_02_email_invalido(self):
        """Valida se o setter do e-mail dispara ValueError para formatos incorretos."""
        end = self.Endereco("Main St", "123", "12345", "Test City", "TS", "US")
        doc = self.DocumentoID("Passaporte", "US123456")
        with self.assertRaises(ValueError):
            # O setter do e-mail deve travar aqui por falta de @
            self.Cliente(2, "Hacker", "email_invalido_sem_arroba", "+1234567890", end, doc)

    def test_03_telefone_invalido(self):
        """Valida se o formato do telefone internacional E.164 é exigido rigorosamente."""
        end = self.Endereco("Main St", "123", "12345", "Test City", "TS", "US")
        doc = self.DocumentoID("Passaporte", "US123456")
        with self.assertRaises(ValueError):
            # O setter deve recusar letras ou formatação quebrada
            self.Cliente(3, "User", "user@test.com", "numero-letras-errado", end, doc)

if __name__ == "__main__":
    unittest.main()

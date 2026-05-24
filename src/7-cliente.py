import re
from typing import Dict, Optional


class Endereco:
    """Encapsula a estrutura de endereço internacional com código postal e país."""
    def __init__(self, rua: str, numero: str, codigo_postal: str, cidade: str, estado: str, pais: str):
        self.rua = rua
        self.numero = numero
        self.codigo_postal = self.validar_codigo_postal(codigo_postal)
        self.cidade = cidade
        self.estado = estado
        self.pais = pais.upper()

    @staticmethod
    def validar_codigo_postal(cp: str) -> str:
        # Sanitização e remoção de caracteres maliciosos
        cp_limpo = re.sub(r'[^\w\s-]', '', cp).strip()
        if not cp_limpo:
            raise ValueError("O código postal/CEP não pode ser vazio ou inválido.")
        return cp_limpo


class DocumentoID:
    """Gerencia a identificação do cliente e valida o tipo de documento informado."""
    TIPOS_PERMITIDOS = ["CPF", "CNPJ", "RG", "PASSAPORTE", "DRIVERS_LICENSE"]

    def __init__(self, tipo: str, numero: str):
        tipo_normalizado = tipo.upper().strip()
        if tipo_normalizado not in self.TIPOS_PERMITIDOS:
            raise ValueError(f"Tipo de documento inválido. Permitidos: {self.TIPOS_PERMITIDOS}")
        
        self.tipo = tipo_normalizado
        # Proteção básica contra injeção de caracteres em campos de ID
        self.numero = re.sub(r'[^\w\s.-]', '', numero).strip()


class Cliente:
    """Classe Cliente expandida e adequada aos padrões internacionais de segurança."""
    def __init__(self, id_cliente: int, nome: str, email: str, telefone: str, 
                 endereco: Endereco, documento: DocumentoID, local_trabalho: Optional[str] = None):
        self._id_cliente = id_cliente
        self._nome = self._sanitizar_texto(nome)
        self.email = email
        self.telefone = telefone
        self.endereco = endereco
        self.documento = documento
        self._local_trabalho = self._sanitizar_texto(local_trabalho) if local_trabalho else None
        self._redes_sociais: Dict[str, str] = {}

    @property
    def id_cliente(self) -> int:
        return self._id_cliente

    @property
    def nome(self) -> str:
        return self._nome

    @property
    def email(self) -> str:
        return self._email

    @email.setter
    def email(self, valor: str):
        # Validação RFC 5322 simplificada e proteção contra regex DOS
        padrao = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(padrao, valor):
            raise ValueError("Formato de e-mail inválido.")
        self._email = valor

    @property
    def telefone(self) -> str:
        return self._telefone

    @telefone.setter
    def telefone(self, valor: str):
        # Validação internacional baseada no padrão E.164 (+PrefixoNumero)
        # Permite de 7 a 15 dígitos numéricos obrigatórios precedidos opcionalmente por +
        padrao_e164 = r"^\+?[1-9]\d{6,14}$"
        valor_limpo = re.sub(r'[\s()-]', '', valor) # Remove espaços e parênteses antes de validar
        if not re.match(padrao_e164, valor_limpo):
            raise ValueError("Formato de telefone internacional inválido. Use o padrão E.164 (Ex: +5511999999999).")
        self._telefone = valor_limpo

    @property
    def local_trabalho(self) -> Optional[str]:
        return self._local_trabalho

    @local_trabalho.setter
    def local_trabalho(self, valor: Optional[str]):
        self._local_trabalho = self._sanitizar_texto(valor) if valor else None

    def adicionar_rede_social(self, plataforma: str, link: str):
        """Valida e adiciona URLs de webpages ou perfis sociais com proteção contra scripts."""
        plat_limpa = self._sanitizar_texto(plataforma).lower()
        # Validação básica de URL segura (http/https)
        if not re.match(r"^https?://[^\s/$.?#].[^\s]*$", link):
            raise ValueError(f"A URL fornecida para {plataforma} é inválida ou insegura.")
        self._redes_sociais[plat_limpa] = link

    def obter_redes_sociais(self) -> Dict[str, str]:
        return self._redes_sociais

    @staticmethod
    def _sanitizar_texto(texto: str) -> str:
        """Proteção defensiva contra injeções de scripts (XSS) e tags HTML em strings."""
        if not texto:
            return ""
        return re.sub(r'<[^>]*>', '', texto).strip()

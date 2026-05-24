import importlib.util
from typing import Any, Dict
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
    raise ImportError(f"Erro ao carregar modulo: {caminho_relativo}")

class UsuarioManager:
    """Gerencia o ciclo de vida e exclusão segura do usuário integrado à Parte 9."""
    def __init__(self, usuario_id: int):
        self.usuario_id = usuario_id
        self.logica_adicao = self._load_logica_adicao()

    def _load_logica_adicao(self) -> Any:
        modulo_9 = carregar_modulo_local("logica_modulo", "src/9-logica_adicao.py")
        return modulo_9.LogicaAdicao()

    def remover_usuario_seguro(self, email: str) -> bool:
        try:
            print(f"⏳ [USUARIO MANAGER]: Solicitando remocao segura para e-mail: {email}")
            # Verifica se o método existe na base antes de prosseguir
            if hasattr(self.logica_adicao, 'remover_usuario'):
                self.logica_adicao.remover_usuario(email)
                print(f"🟢 [SUCESSO]: Usuario {email} removido do barramento local.")
                return True
            else:
                # Fallback caso a exclusão seja manual por dicionário
                if email in self.logica_adicao.clientes:
                    del self.logica_adicao.clientes[email]
                    print(f"🟢 [SUCESSO]: Usuario {email} expurgado via Fallback.")
                    return True
                raise ValueError("Metodo de remocao nao exposto na camada de negocio.")
        except Exception as e:
            print(f"❌ [ERRO DE REMOÇÃO]: {e}")
            return False

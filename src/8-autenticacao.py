import bcrypt
from typing import Optional, Dict


class ServicoAutenticacao:
    def __init__(self):
        self.usuarios: Dict[str, str] = {}  # Dicionário para armazenar e-mails como chave e hashes de senhas como valor

    def cadastrar_usuario(self, email: str, senha: str) -> None:
        """Cadastra um novo usuário no sistema."""
        if email in self.usuarios:
            raise ValueError("Usuário já cadastrado")

        # Gera o hash da senha utilizando Bcrypt
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(senha.encode(), salt)
        
        self.usuarios[email] = hashed_password

    def login_usuario(self, email: str, senha: str) -> bool:
        """Realiza um login no sistema."""
        if email not in self.usuarios:
            raise ValueError("Usuário não cadastrado")

        # Verifica se a senha informada corresponde ao hash armazenado
        return bcrypt.checkpw(senha.encode(), self.usuarios[email])


class AutenticacaoComLimiter(ServicoAutenticacao):
    def __init__(self):
        super().__init__()
        self.tentativas_login: Dict[str, int] = {}

    def cadastrar_usuario(self, email: str, senha: str) -> None:
        """Cadastra um novo usuário no sistema."""
        if len(self.tentativas_login.get(email, [])) >= 3:
            raise ValueError("Número máximo de tentativas excedido. Tente novamente mais tarde.")

        super().cadastrar_usuario(email, senha)

    def login_usuario(self, email: str, senha: str) -> bool:
        """Realiza um login no sistema com limite de tentativas."""
        if len(self.tentativas_login.get(email, [])) >= 3:
            raise ValueError("Número máximo de tentativas excedido. Tente novamente mais tarde.")

        try:
            sucesso = super().login_usuario(email, senha)
            if sucesso:
                # Limpa as tentativas em caso de login bem-sucedido
                self.tentativas_login.pop(email, None)
            else:
                # Incrementa o contador de tentativas em caso de falha
                self.tentativas_login[email] = self.tentativas_login.get(email, 0) + 1

            return sucesso
        except ValueError as e:
            raise e


# Exemplo de uso
if __name__ == "__main__":
    auth_service = AutenticacaoComLimiter()

    try:
        auth_service.cadastrar_usuario("usuario@example.com", "minha_senha")
        print("Usuário cadastrado com sucesso")

        # Tenta logar com senha correta
        if auth_service.login_usuario("usuario@example.com", "minha_senha"):
            print("Login bem-sucedido")

        # Tenta logar com senha incorreta
        try:
            if auth_service.login_usuario("usuario@example.com", "senha_errada"):
                print("Login bem-sucedido")
            else:
                print("Login falhado")
        except ValueError as e:
            print(e)

    except ValueError as e:
        print(e)
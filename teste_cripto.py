import time
import jwt

class TokenService:
    def __init__(self):
        # Define a chave secreta padrão
        self.secret = "pea_plan_chave_mestre_secreta_global_2026"
        self.algorithm = "HS256"

    def generar_access_token(self, usuario_id: int, role: str) -> str:
        agora = int(time.time())
        payload = {
            "sub": usuario_id,
            "role": role,
            "exp": agora + 900,  # 15 minutos de validade
            "iat": agora
        }
        # Garante a geracao do token como string limpa
        token = jwt.encode(payload, self.secret, algorithm=self.algorithm)
        return token if isinstance(token, str) else token.decode('utf-8')

    def validar_token(self, token: str) -> dict:
        try:
            # Forca a decodificacao direta limpando validacoes flutuantes de contexto
            return jwt.decode(
                token, 
                self.secret, 
                algorithms=[self.algorithm],
                options={"verify_signature": True}
            )
        except jwt.ExpiredSignatureError:
            return {"status": "erro", "mensagem": "Token expirado!"}
        except jwt.InvalidTokenError:
            return {"status": "erro", "mensagem": "Assinatura invalida!"}

if __name__ == "__main__":
    svc = TokenService()
    tk = svc.generar_access_token(99, "admin_global")
    print(f"🔑 Token Criado: {tk}\n")
    print(f"✅ Validacao Offline: {svc.validar_token(tk)}")

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { errors?: { code?: string }[] })?.errors?.[0]?.code;
  const messages: Record<string, string> = {
    form_identifier_not_found: "Não encontramos uma conta com este e-mail.",
    form_password_incorrect: "Senha incorreta. Tente novamente.",
    form_identifier_exists: "Este e-mail já está cadastrado.",
    form_password_pwned:
      "Esta senha foi exposta em um vazamento. Escolha outra senha.",
    form_password_length_too_short:
      "A senha é muito curta. Use pelo menos 8 caracteres.",
    form_param_format_invalid: "Confira o formato dos dados informados.",
    form_param_nil: "Preencha todos os campos obrigatórios.",
    form_code_incorrect: "Código de verificação incorreto. Tente novamente.",
    verification_expired:
      "O código de verificação expirou. Solicite um novo código.",
    too_many_requests:
      "Muitas tentativas. Aguarde um momento e tente novamente.",
    network_error: "Verifique sua conexão com a internet e tente novamente.",
  };
  return (
    messages[code ?? ""] ??
    "Não foi possível concluir a autenticação. Confira seus dados e tente novamente."
  );
}

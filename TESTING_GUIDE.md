# 🧪 Guia de Testes - Fluxo Completo

## ✅ Verificação: Schema Executado com Sucesso!

Todas as tabelas, RLS e índices foram criados no Supabase. Agora vamos testar o fluxo end-to-end.

---

## 📝 Teste 1: Registro e Login

### Passo 1.1 - Criar Conta
1. Acesse **http://localhost:3001**
2. Clique em **"Registrar"**
3. Preencha:
   - Email: `seu-email@exemplo.com`
   - Senha: `SenhaForte123!`
4. Clique em **"Registrar"**
5. ✅ Aguarde redirecionamento para Dashboard

### Passo 1.2 - Verificar Sessão
- Seu email deve aparecer no **Header** (canto superior direito)
- Deve haver um botão **"Logout"** disponível

---

## 👥 Teste 2: Gerenciamento de Clientes

### Passo 2.1 - Acessar Clientes
1. No Menu Lateral, clique em **"Clientes"**
2. Clique em **"+ Adicionar Cliente"**

### Passo 2.2 - Criar Cliente
Preencha o formulário:
- **Nome**: João Silva
- **Telefone**: (11) 98765-4321
- **Email**: joao@exemplo.com
- **Consentimento LGPD**: ☑️ Marcado
- Clique em **"Salvar Cliente"**

### Passo 2.3 - Verificar Persistência
1. ✅ Cliente deve aparecer na lista
2. Atualize a página (F5)
3. ✅ Cliente deve ainda estar lá (validando persistência no BD)

### Passo 2.4 - Deletar Cliente
1. Clique em **"Deletar"** ao lado do cliente
2. Confirme a exclusão
3. ✅ Cliente deve desaparecer da lista

---

## 🛠️ Teste 3: Gerenciamento de Serviços

### Passo 3.1 - Acessar Serviços
1. No Menu Lateral, clique em **"Serviços"**
2. Clique em **"+ Adicionar Serviço"**

### Passo 3.2 - Criar Serviço
Preencha o formulário:
- **Nome do Serviço**: Massagem Relaxante
- **Duração (minutos)**: 60
- **Preço (R$)**: 150.00
- Clique em **"Salvar Serviço"**

### Passo 3.3 - Adicionar Mais Serviços
Repita 3.2 com:
- **Corte de Cabelo** - 45 min - R$ 50.00
- **Manicure** - 30 min - R$ 40.00

### Passo 3.4 - Verificar Persistência
1. ✅ Todos os 3 serviços devem aparecer na tabela
2. Atualize a página (F5)
3. ✅ Serviços devem permanecer após reload

---

## 👨‍⚕️ Teste 4: Gerenciamento de Profissionais

### Passo 4.1 - Acessar Profissionais
1. No Menu Lateral, clique em **"Profissionais"**
2. Clique em **"+ Adicionar Profissional"**

### Passo 4.2 - Criar Profissional
Preencha o formulário:
- **Nome**: Ana Silva
- **Email**: ana@exemplo.com
- **Especialidades**: Corte, Coloração
- Clique em **"Salvar Profissional"**

### Passo 4.3 - Adicionar Mais Profissionais
Repita 4.2 com:
- **Bruno Costa** - bruno@exemplo.com - Manicure, Pedicure
- **Carla Dias** - carla@exemplo.com - Estética Facial, Maquiagem

### Passo 4.4 - Verificar Persistência
1. ✅ Todos os 3 profissionais devem aparecer em cards
2. Atualize a página (F5)
3. ✅ Profissionais devem permanecer após reload

---

## 📅 Teste 5: Agendamentos

### Passo 5.1 - Acessar Agendamentos
1. No Menu Lateral, clique em **"Agendamentos"**
2. Você deve ver os agendamentos já criados (ou uma lista vazia)

### Passo 5.2 - Via Chat IA
1. Clique em **"Chat IA"** ou abra o chatbot
2. Digite: "Gostaria de agendar uma massagem relaxante com a Ana Silva amanhã às 14h"
3. A IA vai reconhecer e criar o agendamento
4. ✅ O agendamento deve aparecer na lista de Agendamentos

### Passo 5.3 - Verificar Persistência
1. ✅ Agendamento criado pela IA deve aparecer
2. Atualize a página (F5)
3. ✅ Agendamento deve permanecer (confirmando persistência via IA)

---

## 🔐 Teste 6: Isolamento de Dados (RLS)

### Passo 6.1 - Verificar Isolamento
1. Crie 2 contas diferentes no mesmo navegador:
   - Primeira: `usuario1@exemplo.com`
   - Segunda: `usuario2@exemplo.com`

### Passo 6.2 - Criar Dados em Ambas
- **Usuario 1**: Crie 1 cliente, 1 serviço, 1 profissional
- **Usuario 2**: Crie 1 cliente, 1 serviço, 1 profissional

### Passo 6.3 - Validar Isolamento
1. Faça login como **Usuario 1**
2. ✅ Deve ver apenas seus dados (1 cliente, 1 serviço, 1 profissional)
3. ✅ Não deve ver dados do Usuario 2
4. Faça login como **Usuario 2**
5. ✅ Deve ver apenas seus dados
6. ✅ Não deve ver dados do Usuario 1

---

## 🚨 Teste 7: Erros e Validações

### Passo 7.1 - Cliente Sem Campos Obrigatórios
1. Vá para **Clientes**
2. Tente criar um cliente deixando campos em branco
3. ✅ Deve aparecer mensagem de erro

### Passo 7.2 - Serviço com Preço Inválido
1. Vá para **Serviços**
2. Tente criar um serviço com duração = 0
3. ✅ Deve aparecer mensagem de erro

### Passo 7.3 - Logout e Verificar Redirecionamento
1. Clique em **"Logout"** no Header
2. ✅ Deve ser redirecionado para página de Login
3. ✅ Dados não devem ser acessíveis

---

## 📊 Resultados Esperados

### Se TODOS os testes passarem ✅
- [x] Autenticação funcionando
- [x] CRUD de Clientes persistindo
- [x] CRUD de Serviços persistindo
- [x] CRUD de Profissionais persistindo
- [x] Agendamentos via IA persistindo
- [x] RLS isolando dados entre usuários
- [x] Validações funcionando

### 🎉 Conclusão
A integração Supabase está **100% funcional**!

---

## 🐛 Troubleshooting

### Problema: "Erro ao carregar dados"
- Verifique se o `.env.local` tem as credenciais corretas
- Reinicie o servidor: `npm run dev`
- Limpe o cache (Ctrl+Shift+Delete)

### Problema: "Dados não salvam"
- Verifique se as RLS policies estão ativas no Supabase
- Confirme que as tabelas foram criadas
- Verifique o console (F12) para mais detalhes

### Problema: "Erro 401 Unauthorized"
- Token de autenticação pode estar expirado
- Faça logout e login novamente
- Limpe o localStorage do navegador

---

## 📚 Próximos Passos
1. Implementar backup automático
2. Adicionar logs de auditoria
3. Configurar alertas de segurança
4. Preparar para produção (Vercel)


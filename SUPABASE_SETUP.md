# Configuração Supabase - Guia Completo

## 1. Criar Projeto Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Configure:
   - **Name**: interativixbot
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
4. Clique em "Create new project"
5. Aguarde ~2 minutos para o projeto ser criado

## 2. Obter as Credenciais

1. No painel do Supabase, vá para **Settings** → **API**
2. Copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** (VITE_SUPABASE_ANON_KEY)
3. Abra o arquivo `.env.local` na raiz do projeto
4. Cole os valores:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxx
```

## 3. Criar as Tabelas do Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New query**
3. Cole todo o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **Run**
5. Aguarde a conclusão (você verá "Success")

## 4. Configurar Autenticação por Email

1. Vá para **Authentication** → **Providers**
2. Certifique-se que **Email** está habilitado
3. Configure em **Email Templates** se desejar personalizar emails

## 5. Criar Usuário de Teste

1. Vá para **Authentication** → **Users**
2. Clique em **Add user**
3. Configure:
   - Email: `teste@exemplo.com`
   - Password: `Senha123!`
4. Clique em **Create user**

## 6. Reiniciar o Servidor

```bash
npm run dev
```

## 7. Fazer Login

1. Acesse http://localhost:3000
2. Clique em "Registrar" para criar uma conta
3. Ou use um usuário de teste criado anteriormente

## Fluxo de Funcionamento

### Autenticação
- Login/Signup → Supabase Auth
- Sessão mantida no navegador
- Logout limpa a sessão

### Agendamentos
- Criar agendamento → Salvo em `public.appointments`
- Atualizar status → Sincronizado em tempo real
- Deletar → Removido da base de dados
- Todos os dados filtrados por `user_id`

### Dados Compartilhados
- Clientes, Serviços, Profissionais também persistem
- Cada usuário vê apenas seus próprios dados

## Troubleshooting

### Erro: "Credentials not found"
- Verifique se `.env.local` existe
- Reinicie o servidor com `npm run dev`
- Limpe o cache do navegador (Ctrl+Shift+Delete)

### Erro: "401 Unauthorized"
- Verifique se o `VITE_SUPABASE_ANON_KEY` está correto
- Confirme que a política RLS está habilitada

### Erro: "Unable to connect to database"
- Verifique a URL do Supabase
- Verifique sua conexão de internet
- Confirme que o projeto Supabase está ativo

### Dados não são salvos
- Verifique as políticas RLS (Row Level Security)
- Confirme que as tabelas foram criadas corretamente
- Verifique o console de erros (F12) para mais detalhes

## Proximos Passos

1. ✅ Integrar Clientes com Supabase
2. ✅ Integrar Serviços com Supabase
3. ✅ Integrar Profissionais com Supabase
4. Implementar backup automático
5. Configurar logs e monitoramento
6. Preparar para deploy em produção

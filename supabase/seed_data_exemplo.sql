-- =====================================================
-- DADOS DE EXEMPLO PARA DEMONSTRAÇÃO
-- =====================================================
-- Execute este script após criar uma empresa no sistema
-- Substitua 'YOUR_COMPANY_ID' pelo UUID da sua empresa
-- =====================================================

-- =====================================================
-- 1. SERVIÇOS (5 exemplos)
-- =====================================================
INSERT INTO services (company_id, name, description, duration, price, is_active, category) VALUES
('YOUR_COMPANY_ID', 'Corte Masculino', 'Corte de cabelo masculino completo com finalização', 45, 50.00, true, 'Cabelo'),
('YOUR_COMPANY_ID', 'Corte Feminino', 'Corte de cabelo feminino com lavagem e escovação', 60, 80.00, true, 'Cabelo'),
('YOUR_COMPANY_ID', 'Barba Completa', 'Barba desenhada e aparada com produtos premium', 30, 35.00, true, 'Barba'),
('YOUR_COMPANY_ID', 'Coloração', 'Coloração completa com produtos profissionais', 120, 150.00, true, 'Coloração'),
('YOUR_COMPANY_ID', 'Hidratação Capilar', 'Tratamento de hidratação profunda', 40, 60.00, true, 'Tratamento');

-- =====================================================
-- 2. PROFISSIONAIS (5 exemplos)
-- =====================================================
INSERT INTO professionals (company_id, name, email, phone, specialties, available_days, available_hours, is_active, commission_percentage) VALUES
('YOUR_COMPANY_ID', 'João Silva', 'joao.silva@email.com', '(11) 98765-4321', ARRAY['Corte Masculino', 'Barba'], ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], '09:00-18:00', true, 50),
('YOUR_COMPANY_ID', 'Maria Santos', 'maria.santos@email.com', '(11) 98765-4322', ARRAY['Corte Feminino', 'Coloração'], ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], '08:00-17:00', true, 60),
('YOUR_COMPANY_ID', 'Carlos Oliveira', 'carlos.oliveira@email.com', '(11) 98765-4323', ARRAY['Barba', 'Corte Masculino'], ARRAY['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], '10:00-19:00', true, 45),
('YOUR_COMPANY_ID', 'Ana Paula', 'ana.paula@email.com', '(11) 98765-4324', ARRAY['Hidratação', 'Tratamento'], ARRAY['monday', 'wednesday', 'friday'], '09:00-18:00', true, 55),
('YOUR_COMPANY_ID', 'Pedro Costa', 'pedro.costa@email.com', '(11) 98765-4325', ARRAY['Corte Masculino', 'Corte Feminino'], ARRAY['monday', 'tuesday', 'thursday', 'friday', 'saturday'], '08:00-20:00', true, 50);

-- =====================================================
-- 3. CLIENTES (5 exemplos)
-- =====================================================
INSERT INTO clients (company_id, name, email, phone, birth_date, address, city, state, zip_code, status, notes, tags, last_visit) VALUES
('YOUR_COMPANY_ID', 'Roberto Fernandes', 'roberto.f@email.com', '(11) 99876-5432', '1985-03-15', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'active', 'Cliente preferencial, gosta de atendimento rápido', ARRAY['VIP', 'Fidelizado'], NOW() - INTERVAL '10 days'),
('YOUR_COMPANY_ID', 'Juliana Alves', 'juliana.alves@email.com', '(11) 99876-5433', '1992-07-22', 'Av. Paulista, 456', 'São Paulo', 'SP', '01311-000', 'active', 'Prefere horários pela manhã', ARRAY['Regular'], NOW() - INTERVAL '5 days'),
('YOUR_COMPANY_ID', 'Marcos Pereira', 'marcos.p@email.com', '(11) 99876-5434', '1978-11-08', 'Rua Augusta, 789', 'São Paulo', 'SP', '01305-100', 'active', 'Alérgico a produtos com amônia', ARRAY['Atenção Especial'], NOW() - INTERVAL '15 days'),
('YOUR_COMPANY_ID', 'Fernanda Lima', 'fernanda.lima@email.com', '(11) 99876-5435', '1995-05-30', 'Rua Oscar Freire, 321', 'São Paulo', 'SP', '01426-001', 'active', 'Cliente desde 2020, sempre pontual', ARRAY['VIP', 'Pontual'], NOW() - INTERVAL '7 days'),
('YOUR_COMPANY_ID', 'Ricardo Santos', 'ricardo.santos@email.com', '(11) 99876-5436', '1988-09-12', 'Av. Rebouças, 654', 'São Paulo', 'SP', '05402-000', 'active', 'Prefere o profissional João', ARRAY['Regular'], NOW() - INTERVAL '20 days');

-- =====================================================
-- 4. AGENDAMENTOS (5 exemplos - últimos 30 dias)
-- =====================================================
-- Substitua também SERVICE_ID_1, PROFESSIONAL_ID_1, CLIENT_ID_1, etc.
INSERT INTO appointments (company_id, service_id, professional_id, client_id, date, time, status, notes, price, duration, created_at) VALUES
('YOUR_COMPANY_ID', 'SERVICE_ID_1', 'PROFESSIONAL_ID_1', 'CLIENT_ID_1', CURRENT_DATE - INTERVAL '10 days', '10:00:00', 'Concluído', 'Cliente satisfeito com o resultado', 50.00, 45, NOW() - INTERVAL '10 days'),
('YOUR_COMPANY_ID', 'SERVICE_ID_2', 'PROFESSIONAL_ID_2', 'CLIENT_ID_2', CURRENT_DATE - INTERVAL '5 days', '14:30:00', 'Concluído', 'Retorno agendado para próximo mês', 80.00, 60, NOW() - INTERVAL '5 days'),
('YOUR_COMPANY_ID', 'SERVICE_ID_3', 'PROFESSIONAL_ID_3', 'CLIENT_ID_3', CURRENT_DATE - INTERVAL '15 days', '11:00:00', 'Concluído', 'Solicitou produtos para casa', 35.00, 30, NOW() - INTERVAL '15 days'),
('YOUR_COMPANY_ID', 'SERVICE_ID_4', 'PROFESSIONAL_ID_4', 'CLIENT_ID_4', CURRENT_DATE + INTERVAL '2 days', '15:00:00', 'Confirmado', 'Primeiro tratamento de hidratação', 60.00, 40, NOW()),
('YOUR_COMPANY_ID', 'SERVICE_ID_5', 'PROFESSIONAL_ID_5', 'CLIENT_ID_5', CURRENT_DATE + INTERVAL '5 days', '09:00:00', 'Pendente', 'Aguardando confirmação do cliente', 50.00, 45, NOW());

-- =====================================================
-- 5. CATEGORIAS FINANCEIRAS (5 exemplos)
-- =====================================================
INSERT INTO financial_categories (company_id, name, type, description, color, is_active) VALUES
('YOUR_COMPANY_ID', 'Serviços Prestados', 'income', 'Receita de serviços de cabelo e estética', '#10B981', true),
('YOUR_COMPANY_ID', 'Produtos Vendidos', 'income', 'Venda de produtos para clientes', '#3B82F6', true),
('YOUR_COMPANY_ID', 'Aluguel', 'expense', 'Aluguel do estabelecimento', '#EF4444', true),
('YOUR_COMPANY_ID', 'Salários', 'expense', 'Pagamento de salários e comissões', '#F59E0B', true),
('YOUR_COMPANY_ID', 'Produtos e Insumos', 'expense', 'Compra de produtos e materiais', '#8B5CF6', true);

-- =====================================================
-- 6. TRANSAÇÕES FINANCEIRAS (5 exemplos)
-- =====================================================
INSERT INTO financial_transactions (company_id, category_id, description, amount, type, date, is_paid, payment_method, notes) VALUES
('YOUR_COMPANY_ID', 'CATEGORY_ID_1', 'Corte Masculino - Roberto Fernandes', 50.00, 'income', CURRENT_DATE - INTERVAL '10 days', true, 'Cartão de Crédito', 'Pagamento via Visa'),
('YOUR_COMPANY_ID', 'CATEGORY_ID_1', 'Corte Feminino - Juliana Alves', 80.00, 'income', CURRENT_DATE - INTERVAL '5 days', true, 'Pix', 'Pagamento à vista'),
('YOUR_COMPANY_ID', 'CATEGORY_ID_3', 'Aluguel Mensal - Novembro', 3500.00, 'expense', CURRENT_DATE - INTERVAL '1 day', true, 'Transferência', 'Ref: Nov/2025'),
('YOUR_COMPANY_ID', 'CATEGORY_ID_4', 'Salário - João Silva', 2500.00, 'expense', CURRENT_DATE - INTERVAL '3 days', true, 'Transferência', 'Salário mensal'),
('YOUR_COMPANY_ID', 'CATEGORY_ID_5', 'Compra de Produtos - Fornecedor XYZ', 850.00, 'expense', CURRENT_DATE - INTERVAL '7 days', true, 'Boleto', 'Produtos profissionais');

-- =====================================================
-- 7. METAS FINANCEIRAS (5 exemplos)
-- =====================================================
INSERT INTO financial_goals (company_id, name, description, target_amount, current_amount, deadline, status, category) VALUES
('YOUR_COMPANY_ID', 'Faturamento Novembro', 'Meta de receita mensal', 15000.00, 8500.00, '2025-11-30', 'in_progress', 'Receita'),
('YOUR_COMPANY_ID', 'Redução de Custos', 'Reduzir despesas operacionais em 10%', 5000.00, 3200.00, '2025-12-31', 'in_progress', 'Economia'),
('YOUR_COMPANY_ID', 'Equipamentos Novos', 'Comprar novas cadeiras e espelhos', 8000.00, 4500.00, '2026-02-28', 'in_progress', 'Investimento'),
('YOUR_COMPANY_ID', 'Fundo de Emergência', 'Reserva para imprevistos', 10000.00, 2500.00, '2026-06-30', 'in_progress', 'Reserva'),
('YOUR_COMPANY_ID', 'Faturamento Outubro', 'Meta de receita mensal', 14000.00, 14500.00, '2025-10-31', 'completed', 'Receita');

-- =====================================================
-- 8. CONTAS BANCÁRIAS (5 exemplos)
-- =====================================================
INSERT INTO financial_accounts (company_id, name, type, bank, agency, account_number, balance, is_active) VALUES
('YOUR_COMPANY_ID', 'Conta Corrente Principal', 'checking', 'Banco do Brasil', '1234-5', '12345-6', 15750.00, true),
('YOUR_COMPANY_ID', 'Conta Poupança', 'savings', 'Caixa Econômica', '5678', '98765-4', 8500.00, true),
('YOUR_COMPANY_ID', 'Carteira Digital', 'digital', 'PicPay', '-', '-', 2300.00, true),
('YOUR_COMPANY_ID', 'Caixa Loja', 'cash', '-', '-', '-', 450.00, true),
('YOUR_COMPANY_ID', 'Conta Investimentos', 'investment', 'Nubank', '-', '123456-7', 12000.00, true);

-- =====================================================
-- 9. TAGS DE CLIENTES (5 exemplos)
-- =====================================================
INSERT INTO client_tags (company_id, name, color, description) VALUES
('YOUR_COMPANY_ID', 'VIP', '#FFD700', 'Clientes premium com atendimento prioritário'),
('YOUR_COMPANY_ID', 'Fidelizado', '#10B981', 'Cliente com mais de 6 meses de relacionamento'),
('YOUR_COMPANY_ID', 'Pontual', '#3B82F6', 'Sempre chega no horário marcado'),
('YOUR_COMPANY_ID', 'Atenção Especial', '#F59E0B', 'Requer cuidados especiais ou tem restrições'),
('YOUR_COMPANY_ID', 'Indicador', '#8B5CF6', 'Cliente que trouxe indicações');

-- =====================================================
-- 10. INTERAÇÕES COM CLIENTES (5 exemplos)
-- =====================================================
INSERT INTO client_interactions (company_id, client_id, interaction_type, description, interaction_date, created_by) VALUES
('YOUR_COMPANY_ID', 'CLIENT_ID_1', 'visit', 'Cliente realizou corte masculino e estava muito satisfeito', CURRENT_DATE - INTERVAL '10 days', 'PROFESSIONAL_ID_1'),
('YOUR_COMPANY_ID', 'CLIENT_ID_2', 'call', 'Ligação para confirmar agendamento de amanhã', CURRENT_DATE - INTERVAL '1 day', 'PROFESSIONAL_ID_2'),
('YOUR_COMPANY_ID', 'CLIENT_ID_3', 'whatsapp', 'Cliente solicitou informações sobre novos tratamentos', CURRENT_DATE - INTERVAL '3 days', 'PROFESSIONAL_ID_3'),
('YOUR_COMPANY_ID', 'CLIENT_ID_4', 'email', 'Enviado email com promoção do mês', CURRENT_DATE - INTERVAL '5 days', 'PROFESSIONAL_ID_4'),
('YOUR_COMPANY_ID', 'CLIENT_ID_5', 'visit', 'Primeira visita do cliente, experiência positiva', CURRENT_DATE - INTERVAL '20 days', 'PROFESSIONAL_ID_5');

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Crie uma empresa no sistema e copie o UUID (company_id)
-- 2. Substitua todas as ocorrências de 'YOUR_COMPANY_ID' pelo UUID real
-- 3. Execute primeiro os INSERTs de: services, professionals, clients, categories, accounts, tags
-- 4. Copie os IDs gerados e substitua: SERVICE_ID_X, PROFESSIONAL_ID_X, CLIENT_ID_X, CATEGORY_ID_X
-- 5. Execute os INSERTs de: appointments, transactions, interactions, goals
-- 6. Verifique no dashboard se os dados apareceram corretamente
-- 7. Use esses dados para testar todas as funcionalidades do sistema

-- DICA: Para obter os IDs após inserir:
-- SELECT id, name FROM services WHERE company_id = 'YOUR_COMPANY_ID';
-- SELECT id, name FROM professionals WHERE company_id = 'YOUR_COMPANY_ID';
-- SELECT id, name FROM clients WHERE company_id = 'YOUR_COMPANY_ID';
-- SELECT id, name FROM financial_categories WHERE company_id = 'YOUR_COMPANY_ID';

-- 1) Distribuidor base para o usuário de teste
-- Deixa o banco gerar o id e usa o CNPJ como chave natural

--SENHA: minhaSenha123
INSERT INTO distribuidor (cnpj, nome, geografia, email)
VALUES
  ('12345678000100', 'Distribuidor Teste', 'MG', 'distribuidor.teste@example.com')
ON CONFLICT (cnpj) DO NOTHING
;

-- 2) Usuário e credenciais
INSERT INTO "user" (email, nome, "distribuidorId")
VALUES
  (
    'alyssonlcss@gmail.com',
    'Alysson Teste',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  )
ON CONFLICT (email) DO NOTHING
;

INSERT INTO credentials (username, "passwordHash", "userId")
VALUES
  (
    'alyssonlcss@gmail.com',
    '$2b$10$sBtX5baqZupEz7XJx1PuHekJOQgvmjlzC7VO3TG13IyqFCjvTcKzG',
    (SELECT id FROM "user" WHERE email = 'alyssonlcss@gmail.com')
  )
ON CONFLICT (username) DO NOTHING
;

-- 3) Leads de teste (10 no total)
--   - Leads 1 a 5 vinculados ao distribuidor 1
--   - Leads 6 a 10 sem distribuidor (distribuidorId nulo)
INSERT INTO lead (nome, cpf, email, telefone, status, "distribuidorId", comentario)
VALUES
  (
    'Produtor Teste 01',
    '00150519869',
    'produtor01@example.com',
    '5511900000001',
    'novo',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    'Lead do distribuidor 1'
  ),
  (
    'Produtor Teste 02',
    '02645646859',
    'produtor02@example.com',
    '5511900000002',
    'novo',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    'Lead do distribuidor 1'
  ),
  (
    'Produtor Teste 03',
    '11266033092',
    'produtor03@example.com',
    '5511900000003',
    'contatoInicial',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    'Lead do distribuidor 1'
  ),
  (
    'Produtor Teste 04',
    '24424629660',
    'produtor04@example.com',
    '5511900000004',
    'negociando',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    'Lead do distribuidor 1'
  ),
  (
    'Produtor Teste 05',
    '39812126147',
    'produtor05@example.com',
    '5511900000005',
    'novo',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    'Lead do distribuidor 1'
  ),
  (
    'Produtor Teste 06',
    '46744405721',
    'produtor06@example.com',
    '5511900000006',
    'novo',
    NULL,
    'Lead sem distribuidor'
  ),
  (
    'Produtor Teste 07',
    '62303166411',
    'produtor07@example.com',
    '5511900000007',
    'novo',
    NULL,
    'Lead sem distribuidor'
  ),
  (
    'Produtor Teste 08',
    '68737206311',
    'produtor08@example.com',
    '5511900000008',
    'contatoInicial',
    NULL,
    'Lead sem distribuidor'
  ),
  (
    'Produtor Teste 09',
    '93506639617',
    'produtor09@example.com',
    '5511900000009',
    'negociando',
    NULL,
    'Lead sem distribuidor'
  ),
  (
    'Produtor Teste 10',
    '95190587967',
    'produtor10@example.com',
    '5511900000010',
    'novo',
    NULL,
    'Lead sem distribuidor'
  )
ON CONFLICT (cpf) DO NOTHING
;

-- 4) Propriedades rurais (10 no total)
--   - Propriedades 1 a 5 com distribuidorId = 1 (associadas a leads 1..5)
--   - Propriedades 6 a 10 sem distribuidorId (associadas a leads 6..10)
--
-- A tabela gerada pelo TypeORM para a entidade PropriedadeRural usa snake_case:
--   "propriedade_rural" (e não "propriedadeRural").
-- Por isso ajustamos o nome aqui para evitar erro de relação inexistente.
INSERT INTO "propriedade_rural" (nome, cultura, hectares, uf, cidade, geometria, "distribuidorId", latitude, longitude, "leadId")
VALUES
  (
    'Fazenda Teste 01',
    'soja',
    120,
    'MG',
    'Uberlândia',
    NULL,
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    -18.9186,
    -48.2772,
    (SELECT id FROM lead WHERE cpf = '00150519869')
  ),
  (
    'Fazenda Teste 02',
    'milho',
    85,
    'MG',
    'Uberaba',
    NULL,
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    -19.7472,
    -47.9381,
    (SELECT id FROM lead WHERE cpf = '02645646859')
  ),
  (
    'Fazenda Teste 03',
    'cana-de-açúcar',
    300,
    'MG',
    'Patos de Minas',
    NULL,
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    -18.5873,
    -46.5146,
    (SELECT id FROM lead WHERE cpf = '11266033092')
  ),
  (
    'Fazenda Teste 04',
    'algodão',
    220,
    'MG',
    'Uberlândia',
    NULL,
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    -18.9500,
    -48.2500,
    (SELECT id FROM lead WHERE cpf = '24424629660')
  ),
  (
    'Fazenda Teste 05',
    'trigo',
    95,
    'MG',
    'Uberaba',
    NULL,
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100'),
    -19.8000,
    -47.9500,
    (SELECT id FROM lead WHERE cpf = '39812126147')
  ),
  (
    'Fazenda Teste 06',
    'soja',
    400,
    'MG',
    'Montes Claros',
    NULL,
    NULL,
    -16.7282,
    -43.8578,
    (SELECT id FROM lead WHERE cpf = '46744405721')
  ),
  (
    'Fazenda Teste 07',
    'milho',
    45,
    'MG',
    'Montes Claros',
    NULL,
    NULL,
    -16.7500,
    -43.8500,
    (SELECT id FROM lead WHERE cpf = '62303166411')
  ),
  (
    'Fazenda Teste 08',
    'café',
    70,
    'MG',
    'Patos de Minas',
    NULL,
    NULL,
    -18.6000,
    -46.5000,
    (SELECT id FROM lead WHERE cpf = '68737206311')
  ),
  (
    'Fazenda Teste 09',
    'cana-de-açúcar',
    150,
    'MG',
    'Uberlândia',
    NULL,
    NULL,
    -18.9000,
    -48.3000,
    (SELECT id FROM lead WHERE cpf = '93506639617')
  ),
  (
    'Fazenda Teste 10',
    'soja',
    350,
    'MG',
    'Uberaba',
    NULL,
    NULL,
    -19.7200,
    -47.9000,
    (SELECT id FROM lead WHERE cpf = '95190587967')
  );

-- 5) Produtos (10 no total)
--   - Todos vinculados ao distribuidor 1
INSERT INTO produto (nome, categoria, "custoUnidade", "unidadeMedida", "distribuidorId")
VALUES
  (
    'Herbicida Soja Premium',
    ARRAY['soja', 'milho'],
    120.50,
    'litro',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Fertilizante Milho Turbo',
    ARRAY['milho'],
    95.00,
    'quilo',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Inseticida Cana Forte',
    ARRAY['cana-de-açúcar'],
    210.00,
    'litro',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Herbicida Algodão Max',
    ARRAY['algodão'],
    180.00,
    'litro',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Fertilizante Trigo Plus',
    ARRAY['trigo'],
    88.00,
    'quilo',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Combo Soja & Milho',
    ARRAY['soja', 'milho'],
    150.00,
    'tonelada',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Nutrição Café Especial',
    ARRAY['café'],
    130.00,
    'quilo',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Herbicida Multi Culturas',
    ARRAY['soja', 'milho', 'trigo'],
    200.00,
    'litro',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Fertilizante Cana Energia',
    ARRAY['cana-de-açúcar'],
    175.00,
    'tonelada',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  ),
  (
    'Tratamento Semente Soja TOP',
    ARRAY['soja'],
    220.00,
    'quilo',
    (SELECT id FROM distribuidor WHERE cnpj = '12345678000100')
  )
ON CONFLICT (nome) DO NOTHING
;

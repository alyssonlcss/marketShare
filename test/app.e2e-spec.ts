import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Distribuidor } from '../src/domain/entities/distribuidor.entity';
import { User } from './../src/user/entity/user.entity';
import { Credentials } from '../src/domain/entities/credentials.entity';
import { Produto } from '../src/domain/entities/produto.entity';
import { Lead } from '../src/domain/entities/lead.entity';
import { PropriedadeRural } from './../src/propriedade-rural/entity/propriedade-rural.entity';
import { AuthUtils } from '../src/domain/auth/utils/auth.utils';

describe('App (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let httpServer: any;
  let jwtToken: string;
  let distribuidorId: number;
  let otherDistribuidorId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    httpServer = app.getHttpServer();

    // Garante que os registros usados nos testes existem, sem apagar dados anteriores
    const distribuidorRepo = dataSource.getRepository(Distribuidor);

    // Distribuidor principal do usuário de teste
    let distribuidor = await distribuidorRepo.findOne({
      where: { email: 'e2e-distribuidor@example.com' },
    });

    if (!distribuidor) {
      distribuidor = distribuidorRepo.create({
        cnpj: '00000000000191',
        nome: 'Distribuidor E2E',
        geografia: 'BR',
        email: 'e2e-distribuidor@example.com',
      });
      await distribuidorRepo.save(distribuidor);
    }
    distribuidorId = distribuidor.id;

    // Segundo distribuidor para testar regras de visibilidade de leads/propriedades
    let otherDistribuidor = await distribuidorRepo.findOne({
      where: { email: 'outro-distribuidor@example.com' },
    });

    if (!otherDistribuidor) {
      otherDistribuidor = distribuidorRepo.create({
        cnpj: '00000000000272',
        nome: 'Outro Distribuidor',
        geografia: 'BR',
        email: 'outro-distribuidor@example.com',
      });
      await distribuidorRepo.save(otherDistribuidor);
    }
    otherDistribuidorId = otherDistribuidor.id;

    // Usuário de teste vinculado ao distribuidor principal
    const userRepo = dataSource.getRepository(User);
    let user = await userRepo.findOne({
      where: { email: 'e2e-user@example.com' },
      relations: ['distribuidor'],
    });

    if (!user) {
      user = userRepo.create({
        email: 'e2e-user@example.com',
        nome: 'E2E User',
        distribuidor,
      });
      await userRepo.save(user);
    }

    // Credenciais para o usuário de teste
    const credentialsRepo = dataSource.getRepository(Credentials);
    let credentials = await credentialsRepo.findOne({
      where: { username: 'e2euser' },
      relations: ['user'],
    });

    if (!credentials) {
      const passwordHash = await AuthUtils.hashPassword('secret123');
      credentials = credentialsRepo.create({
        username: 'e2euser',
        passwordHash,
        user,
      });
      await credentialsRepo.save(credentials);
    }

    // Faz login para obter um JWT válido
    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ username: 'e2euser', password: 'secret123' })
      .expect(201);

    jwtToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / deve responder 200 e Hello World', async () => {
    await request(httpServer).get('/').expect(200).expect('Hello World!');
  });

  it('POST /auth/login deve retornar um JWT válido', async () => {
    const res = await request(httpServer)
      .post('/auth/login')
      .send({ username: 'e2euser', password: 'secret123' })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });

  it('POST /auth/login com senha inválida deve retornar 401', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({ username: 'e2euser', password: 'wrong' })
      .expect(401);
  });

  it('GET /produto deve respeitar autenticação JWT', async () => {
    const res = await request(httpServer)
      .get('/produto')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /produto sem token deve retornar 401', async () => {
    await request(httpServer).get('/produto').expect(401);
  });

  it('POST /produto + GET /produto deve criar e listar produto do distribuidor do usuário', async () => {
    const createBody = {
      nome: 'Produto E2E',
      categoria: ['teste'],
      unidadeMedida: 'tonelada',
      custoUnidade: 100,
      distribuidorId, // usado apenas para satisfazer o DTO; service usa o distribuidor do usuário
    };

    const createRes = await request(httpServer)
      .post('/produto')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createBody);

    // Se já existir um produto com esse nome, o service retorna 409 (Conflict)
    expect([201, 409]).toContain(createRes.status);

    if (createRes.status === 201) {
      expect(createRes.body.nome).toBe('Produto E2E');
    }

    const listRes = await request(httpServer)
      .get('/produto')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    const names = (listRes.body as any[]).map((p) => p.nome);
    expect(names).toContain('Produto E2E');
  });

  it('POST /lead + GET /lead deve criar e listar lead do distribuidor do usuário', async () => {
    const cpf = '52998224725';

    const createBody = {
      nome: 'Lead E2E',
      cpf,
      status: 'novo',
      distribuidorId,
      comentario: 'Lead de teste e2e',
      email: 'lead.e2e@example.com',
      telefone: '+55 11 99999-0001',
    };

    const createRes = await request(httpServer)
      .post('/lead')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createBody);

    // CPF é único; se já existir, o service retorna 409
    expect([201, 409]).toContain(createRes.status);

    if (createRes.status === 201) {
      expect(createRes.body.id).toBeDefined();
      expect(createRes.body.cpf.replace(/\D/g, '')).toBe(cpf);
    }

    const listRes = await request(httpServer)
      .get('/lead')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    const leads = listRes.body as any[];
    const found = leads.find((l) => l.cpf.replace(/\D/g, '') === cpf);

    expect(found).toBeDefined();
  });

  it('GET /lead e GET /propriedade-rural devem respeitar regras de visibilidade com propriedades sem distribuidor', async () => {
    // Cria lead vinculado a outro distribuidor
    const leadRepo = dataSource.getRepository(Lead);
    const distRepo = dataSource.getRepository(Distribuidor);
    const otherDistribuidor = await distRepo.findOne({ where: { id: otherDistribuidorId } });

    let leadOutro = await leadRepo.findOne({ where: { cpf: '39053344705' }, relations: ['distribuidor'] });

    if (!leadOutro) {
      leadOutro = leadRepo.create({
        nome: 'Lead Outro Distribuidor',
        cpf: '39053344705',
        email: 'lead.outro@example.com',
        telefone: '+55 11 99999-0002',
        distribuidor: otherDistribuidor!,
      });
      await leadRepo.save(leadOutro);
    }

    // Cria propriedade rural para este lead, sem distribuidor associado
    const propRepo = dataSource.getRepository(PropriedadeRural);
    let propriedade = await propRepo.findOne({
      where: {
        lead: { id: leadOutro.id },
        cultura: 'Soja',
        hectares: 50,
        uf: 'GO',
        cidade: 'Rio Verde',
      },
      relations: ['lead', 'distribuidor'],
    });

    if (!propriedade) {
      propriedade = propRepo.create({
        cultura: 'Soja',
        hectares: 50,
        uf: 'GO',
        cidade: 'Rio Verde',
        latitude: 1,
        longitude: 1,
        lead: leadOutro,
      });
      await propRepo.save(propriedade);
    }

    // Mesmo com lead de outro distribuidor, ele deve aparecer para o usuário
    const leadListRes = await request(httpServer)
      .get('/lead')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    const leads = leadListRes.body as any[];
    const foundLead = leads.find((l) => l.cpf.replace(/\D/g, '') === '39053344705');
    expect(foundLead).toBeDefined();

    // A propriedade rural também deve ser visível (distribuidorId nulo)
    const propListRes = await request(httpServer)
      .get('/propriedade-rural')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    const propriedades = propListRes.body as any[];
    const foundProp = propriedades.find((p) => p.id === propriedade.id);
    expect(foundProp).toBeDefined();
    expect(foundProp.distribuidor).toBeNull();
  });

  it('POST /propriedade-rural + GET /propriedade-rural deve criar e listar propriedade vinculada ao distribuidor do usuário', async () => {
    // Primeiro cria um lead para o distribuidor do usuário
    const cpf = '16899535009';

    const leadRes = await request(httpServer)
      .post('/lead')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        nome: 'Lead Propriedade',
        cpf,
        status: 'novo',
        distribuidorId,
        email: 'lead.propriedade@example.com',
        telefone: '+55 11 99999-0003',
      });

    // Se o lead já existir, o POST retorna 409; nesse caso, buscamos o id existente
    expect([201, 409]).toContain(leadRes.status);

    let leadId: number;
    if (leadRes.status === 201) {
      leadId = leadRes.body.id;
    } else {
      const leadRepo = dataSource.getRepository(Lead);
      const existingLead = await leadRepo.findOne({ where: { cpf } });
      expect(existingLead).toBeDefined();
      leadId = existingLead!.id;
    }

    const createBody = {
      cultura: 'Milho',
      hectares: 120,
      uf: 'MT',
      cidade: 'Rondonópolis',
      geometria: 'POLYGON(...)',
      leadId,
      distribuidorId,
      latitude: -15.1234,
      longitude: -47.9876,
    };

    const createRes = await request(httpServer)
      .post('/propriedade-rural')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createBody)
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.cultura).toBe('Milho');

    const listRes = await request(httpServer)
      .get('/propriedade-rural')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    const propriedades = listRes.body as any[];
    const found = propriedades.find((p) => p.cultura === 'Milho');

    expect(found).toBeDefined();
    expect(found.lead).toBeDefined();
    expect(found.lead.id).toBe(leadId);
  });

  it('CRUD completo de /produto (POST, PATCH, GET, DELETE)', async () => {
    // Cria um novo produto
    const createRes = await request(httpServer)
      .post('/produto')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        nome: 'Produto E2E CRUD',
        categoria: ['crud'],
        unidadeMedida: 'tonelada',
        custoUnidade: 50,
        distribuidorId,
      })
      .expect(201);

    const produtoId = createRes.body.id;
    expect(produtoId).toBeDefined();

    // Atualiza parcialmente o produto
    await request(httpServer)
      .patch(`/produto/${produtoId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ nome: 'Produto E2E CRUD Atualizado' })
      .expect(200);

    // Verifica se o produto foi atualizado
    const getRes = await request(httpServer)
      .get(`/produto/${produtoId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(getRes.body.nome).toBe('Produto E2E CRUD Atualizado');

    // Remove o produto
    await request(httpServer)
      .delete(`/produto/${produtoId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    // Garantir que não é mais encontrado
    await request(httpServer)
      .get(`/produto/${produtoId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });

  it('CRUD completo de /lead (POST, PATCH, GET, DELETE)', async () => {
    const cpf = '15350946056';

    // Cria um lead
    const createRes = await request(httpServer)
      .post('/lead')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        nome: 'Lead CRUD',
        cpf,
        status: 'novo',
        distribuidorId,
        email: 'lead.crud@example.com',
        telefone: '+55 11 99999-0004',
      })
      .expect(201);

    const leadId = createRes.body.id;
    expect(leadId).toBeDefined();

    // Atualiza o lead (PATCH)
    await request(httpServer)
      .patch(`/lead/${leadId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        nome: 'Lead CRUD Atualizado',
        status: 'negociando',
        email: 'lead.crud.atualizado@example.com',
        telefone: '+55 11 98888-0004',
      })
      .expect(200);

    // Verifica atualização via GET /lead/:id
    const getRes = await request(httpServer)
      .get(`/lead/${leadId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(getRes.body.nome).toBe('Lead CRUD Atualizado');
    expect(getRes.body.status).toBe('negociando');

    // Remove o lead
    await request(httpServer)
      .delete(`/lead/${leadId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    // Agora deve retornar 404
    await request(httpServer)
      .get(`/lead/${leadId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });

  it('CRUD completo de /propriedade-rural (POST, PATCH, GET, DELETE)', async () => {
    // Cria um lead de apoio diretamente via repositório
    const distRepo = dataSource.getRepository(Distribuidor);
    const leadRepo = dataSource.getRepository(Lead);
    const dist = await distRepo.findOne({ where: { id: distribuidorId } });

    let leadEntity = await leadRepo.findOne({ where: { cpf: '68025810020' }, relations: ['distribuidor'] });

    if (!leadEntity) {
      leadEntity = leadRepo.create({
        nome: 'Lead Propriedade CRUD',
        cpf: '68025810020',
        status: 'novo',
        email: 'lead.propriedade.crud@example.com',
        telefone: '+55 11 99999-0005',
        distribuidor: dist!,
      });
      await leadRepo.save(leadEntity);
    }

    const leadId = leadEntity.id;

    // Cria propriedade rural
    const createRes = await request(httpServer)
      .post('/propriedade-rural')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        cultura: 'Algodão',
        hectares: 80,
        uf: 'BA',
        cidade: 'Barreiras',
        leadId,
        latitude: -10.0,
        longitude: -45.0,
      })
      .expect(201);

    const propId = createRes.body.id;
    expect(propId).toBeDefined();

    // Atualiza parcialmente a propriedade
    await request(httpServer)
      .patch(`/propriedade-rural/${propId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ cultura: 'Algodão Atualizado' })
      .expect(200);

    // Verifica via GET /propriedade-rural/:id
    const getRes = await request(httpServer)
      .get(`/propriedade-rural/${propId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(getRes.body.cultura).toBe('Algodão Atualizado');

    // Remove a propriedade
    await request(httpServer)
      .delete(`/propriedade-rural/${propId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    // Agora deve retornar 404
    await request(httpServer)
      .get(`/propriedade-rural/${propId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});

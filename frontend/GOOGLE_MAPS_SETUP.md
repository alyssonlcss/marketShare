# Configuração do Google Maps

## Como obter uma API Key do Google Maps

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Maps JavaScript API**:
   - No menu lateral, vá em "APIs e Serviços" → "Biblioteca"
   - Pesquise por "Maps JavaScript API"
   - Clique em "Ativar"
4. Crie credenciais:
   - Vá em "APIs e Serviços" → "Credenciais"
   - Clique em "Criar credenciais" → "Chave de API"
   - Copie a chave gerada

## Como configurar no projeto

### Opção 1: Configuração nos Environments (Recomendado para produção)

Edite os arquivos:
- `src/environments/environment.development.ts`
- `src/environments/environment.ts`

Substitua `YOUR_GOOGLE_MAPS_API_KEY` pela sua chave real.

### Opção 2: Diretamente no componente (Para desenvolvimento rápido)

No arquivo `src/app/features/mapa-propriedades/mapa-propriedades.component.ts`, na linha 59, substitua:

```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_AQUI`;
```

## Recursos do Mapa

O componente de mapa oferece:

✅ **Visualização de propriedades rurais** com marcadores no mapa  
✅ **InfoWindow** ao clicar nos marcadores mostrando:
  - Cultura
  - Área em hectares
  - Localização (cidade/estado)
  - Coordenadas geográficas

✅ **Centralização automática** baseada nas propriedades exibidas  
✅ **Zoom adaptativo** conforme quantidade de propriedades  
✅ **Mapa híbrido** (satélite + rótulos) por padrão  
✅ **Badge de contagem** mostrando total de propriedades mapeadas  

## Restrições de API (Recomendado)

Para segurança, restrinja sua API Key:

1. No Google Cloud Console, vá em "Credenciais"
2. Clique na sua chave de API
3. Em "Restrições de aplicativo":
   - Selecione "Referenciadores HTTP (sites)"
   - Adicione: `http://localhost:4200/*` (desenvolvimento)
   - Adicione seu domínio de produção quando disponível

4. Em "Restrições de API":
   - Selecione "Restringir chave"
   - Marque apenas "Maps JavaScript API"

## Troubleshooting

### Erro: "Google Maps JavaScript API error: RefererNotAllowedMapError"
- Verifique se adicionou `http://localhost:4200/*` nas restrições de referenciador

### Mapa não aparece / fica cinza
- Verifique se a API Key está correta
- Verifique se a Maps JavaScript API está ativada no seu projeto
- Verifique o console do navegador para erros específicos

### Marcadores não aparecem
- Verifique se as propriedades têm valores válidos de latitude/longitude
- Verifique se o backend está retornando `propriedadesRurais` dentro dos leads

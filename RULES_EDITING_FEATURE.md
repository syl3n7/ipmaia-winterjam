# ✅ Funcionalidade de Edição de Regras Implementada

## 📋 Visão Geral

Foi implementada uma funcionalidade completa de gestão de conteúdo para a página de regras da WinterJam. Agora pode editar todo o conteúdo da página de regras através do painel de administração, mantendo o design bonito com todos os estilos Tailwind.

## 🎯 O Que Foi Feito

### 1. **Base de Dados** ✅
- Criada tabela `rules_content` com 7 secções:
  - `pdf_url` - URL do PDF de regras
  - `conduct` - Código de Conduta
  - `guidelines` - Diretrizes para Criação de Jogos
  - `prizes` - Prémios
  - `evaluation` - Critérios de Avaliação
  - `participation` - Regras de Participação
  - `schedule` - Horário do Evento

### 2. **API Endpoints** ✅
- **GET `/api/rules/content`** - Endpoint público para obter conteúdo das regras
- **GET `/api/rules/admin/content`** - Endpoint protegido para admin obter conteúdo
- **PUT `/api/rules/admin/content`** - Endpoint protegido para admin guardar conteúdo

### 3. **Frontend (Página de Regras)** ✅
- Convertida de estática para dinâmica (`/src/app/rules/page.js`)
- Agora busca conteúdo da API em vez de estar hardcoded
- Mantém todo o design bonito com classes Tailwind
- Usa `dangerouslySetInnerHTML` para renderizar HTML do banco de dados

### 4. **Admin Dashboard** ✅
- Adicionado botão **"📋 Regras"** na navegação
- Nova secção de edição de regras com:
  - Campo para URL do PDF
  - 6 áreas de texto para cada secção de conteúdo
  - Botão "Guardar Regras"
  - Botão "Recarregar" para restaurar valores atuais
  - Mensagens de status em português

### 5. **Migrações Automáticas** ✅
- Script `add-rules-content.js` cria tabela e popula com conteúdo padrão
- Integrado no `docker-start.sh` para executar automaticamente
- Usa `ON CONFLICT DO NOTHING` para não sobrescrever conteúdo existente

## 🚀 Como Usar

### Para Editar as Regras:

1. Aceda ao painel de administração
2. Clique no botão **"📋 Regras"** na navegação
3. Edite o conteúdo em qualquer campo (pode usar HTML!)
4. Clique em **"💾 Guardar Regras"**
5. Visite `/rules` no site para ver as alterações

### Formatação HTML Permitida:

Pode usar qualquer HTML válido incluindo:
- Tags de estrutura: `<div>`, `<p>`, `<ul>`, `<li>`, etc.
- Classes Tailwind: `bg-blue-50`, `p-4`, `rounded`, `font-bold`, etc.
- Cores de fundo: `bg-gray-50`, `bg-blue-50`, `bg-green-50`, `bg-yellow-50`
- Layouts: `grid`, `space-y-4`, `flex`, `justify-between`

## 📁 Arquivos Modificados/Criados

### Novos Arquivos:
- `/backend/routes/rules.js` - API routes para regras
- `/backend/scripts/add-rules-content.js` - Migration script
- `/RULES_EDITING_FEATURE.md` - Esta documentação

### Arquivos Modificados:
- `/backend/server.js` - Registado routes `/api/rules`
- `/backend/scripts/docker-start.sh` - Adicionada migração de regras
- `/backend/admin/dist/index.html` - Adicionada secção de edição de regras
- `/src/app/rules/page.js` - Convertido para dinâmico (busca da API)

## 🔒 Segurança

- Endpoints admin protegidos por autenticação (requer admin ou super_admin)
- Mesmo-origin requests já protegidos por sessão
- HTML é renderizado com `dangerouslySetInnerHTML` mas apenas admins podem editar

## 💾 Dados Padrão

Ao executar a migração pela primeira vez, são criados conteúdos padrão em português com todo o HTML e estilos Tailwind preservados do design original.

## 🎨 Design Preservado

Todo o design bonito da página de regras foi preservado:
- Cartões coloridos (cinza, azul, verde, amarelo)
- Espaçamento consistente
- Layout responsivo
- Ícones e formatação
- Hierarquia visual clara

## ✨ Próximos Passos (Opcional)

Se desejar melhorar ainda mais:
1. Adicionar editor WYSIWYG (TinyMCE, CKEditor, etc.)
2. Preview em tempo real das alterações
3. Histórico de versões
4. Restaurar versões anteriores

## 🐛 Notas Técnicas

- As chaves das secções foram padronizadas (`conduct`, `guidelines`, etc.)
- A migração usa `ON CONFLICT` para não sobrescrever dados existentes
- O frontend mostra "A carregar regras..." enquanto busca dados
- Mensagens de erro são tratadas graciosamente

# 🔘 Lógica dos Botões da Página Inicial

## Como Funciona

O sistema **automaticamente** muda os botões da página inicial baseado nas datas do evento ativo (game jam).

### 📅 Estados do Evento

1. **ANTES do Evento Começar**
   - **Quando**: Antes da data de início (`start_date`)
   - **Botão**: Configurável em "Botão ANTES do Evento"
   - **Exemplo**: "Inscrever Agora" → `/enlist-now`
   - **Uso**: Inscrições, informações, preparação

2. **DURANTE o Evento**
   - **Quando**: Entre `start_date` e `end_date`
   - **Botão**: Configurável em "Botão DURANTE o Evento"
   - **Mensagem**: "Evento a decorrer!" (configurável)
   - **Exemplo**: "Ver Regras" → `/rules`
   - **Uso**: Regras, suporte, informações do evento em curso

3. **DEPOIS do Evento Terminar**
   - **Quando**: Após a data de fim (`end_date`)
   - **Botão**: Configurável em "Botão DEPOIS do Evento"
   - **Exemplo**: "Ver Jogos Submetidos" → `/archive/2025/winter`
   - **Uso**: Ver jogos, resultados, galeria

## 🎯 Configuração no Admin

### Aceder às Configurações:
1. Ir para o **Painel de Administração**
2. Clicar em **"🏠 Página Inicial"** no menu
3. Ir para a secção **"🔘 Configuração de Botões"**

### Campos Disponíveis:

#### Botão ANTES do Evento
- **Texto**: O que aparece no botão (ex: "Inscrever Agora", "Saber Mais")
- **URL**: Para onde o botão redireciona (ex: `/enlist-now`, `https://forms.microsoft.com/...`)

#### Botão DURANTE o Evento
- **Texto**: O que aparece no botão (ex: "Ver Regras", "Submeter Jogo")
- **URL**: Para onde o botão redireciona (ex: `/rules`, `/submit`)

#### Botão DEPOIS do Evento
- **Texto**: O que aparece no botão (ex: "Ver Jogos Submetidos", "Ver Todos os Jogos")
- **URL**: Para onde o botão redireciona (ex: `/archive/2025/winter`, `/games`)

## 💡 Exemplos de Uso

### Cenário 1: Game Jam Ativa (não começou)
```
Data atual: 10/02/2025
Evento: 14/02/2025 - 16/02/2025
Estado: ANTES do evento
Botão mostrado: "Inscrever Agora" → /enlist-now
```

### Cenário 2: Game Jam a Decorrer
```
Data atual: 15/02/2025
Evento: 14/02/2025 - 16/02/2025
Estado: DURANTE o evento
Mensagem: "Evento a decorrer!"
Botão mostrado: "Ver Regras" → /rules
```

### Cenário 3: Game Jam Terminada (mas ainda ativa)
```
Data atual: 20/02/2025
Evento: 14/02/2025 - 16/02/2025
Estado: DEPOIS do evento
Botão mostrado: "Ver Jogos Submetidos" → /archive/2025/winter
```

## 🎮 Dica: Game Jam Ativa vs Inativa

- **Game Jam ATIVA** (`is_active = true`): 
  - Aparece na página inicial
  - Botões mudam baseado nas datas
  - Útil para manter jogos visíveis após o evento

- **Game Jam INATIVA** (`is_active = false`):
  - Não aparece na página inicial
  - Apenas no arquivo
  - Útil para eventos passados que não quer destacar

## 📝 Notas Importantes

1. O sistema verifica a data/hora **atual** do servidor
2. As mudanças de botão são **automáticas** - não precisa de fazer nada manualmente
3. Pode ter várias game jams no sistema, mas apenas a **ativa** afeta a página inicial
4. Se tiver uma game jam ativa que já terminou, vai mostrar o botão "Ver Jogos Submetidos" automaticamente

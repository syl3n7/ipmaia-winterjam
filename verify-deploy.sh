#!/bin/bash

# 🚀 IPMAIA WinterJam - Script de Verificação Pós-Deploy
# Este script verifica se todos os serviços estão funcionando correctamente após o deployment

set -e

echo "🔍 IPMAIA WinterJam - Verificação Pós-Deploy"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    if [ "$2" = "OK" ]; then
        echo -e "${GREEN}✅ $1: $2${NC}"
    elif [ "$2" = "FAIL" ]; then
        echo -e "${RED}❌ $1: $2${NC}"
    elif [ "$2" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $1: $2${NC}"
    else
        echo -e "${BLUE}ℹ️  $1: $2${NC}"
    fi
}

# Verificar se Docker Compose está em execução
echo ""
echo "🐳 Verificando containers Docker..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_status "Docker Compose" "OK"
else
    print_status "Docker Compose" "FAIL"
    echo "❌ Containers não estão em execução. Execute: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

# Verificar status individual dos containers
echo ""
echo "📦 Verificando containers individuais..."

containers=("db" "backend" "frontend" "nginx")
for container in "${containers[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps "$container" | grep -q "Up"; then
        print_status "Container: $container" "OK"
    else
        print_status "Container: $container" "FAIL"
    fi
done

# Aguardar containers ficarem prontos
echo ""
echo "⏳ Aguardando containers ficarem prontos..."
sleep 10

# Verificar health checks
echo ""
echo "🏥 Verificando health checks..."

# Database health
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    print_status "Database Health" "OK"
else
    print_status "Database Health" "FAIL"
fi

# Backend health
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    BACKEND_RESPONSE=$(curl -s http://localhost:3001/health | jq -r '.status' 2>/dev/null || echo "unknown")
    if [ "$BACKEND_RESPONSE" = "ok" ]; then
        print_status "Backend Health" "OK"
    else
        print_status "Backend Health" "WARN - Response: $BACKEND_RESPONSE"
    fi
else
    print_status "Backend Health" "FAIL"
fi

# Frontend health (verificar se responde)
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend Health" "OK"
else
    print_status "Frontend Health" "FAIL"
fi

# Nginx health
if curl -s http://localhost > /dev/null 2>&1; then
    print_status "Nginx Health" "OK"
else
    print_status "Nginx Health" "FAIL"
fi

# Verificar conectividade da base de dados
echo ""
echo "🗄️  Verificando base de dados..."

DB_TABLES=$(docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d winterjam -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$DB_TABLES" -gt "0" ]; then
    print_status "Database Tables" "OK - $DB_TABLES tabelas encontradas"
else
    print_status "Database Tables" "WARN - Nenhuma tabela encontrada"
fi

# Verificar se as tabelas principais existem
GAME_JAMS_TABLE=$(docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d winterjam -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_jams');" 2>/dev/null | tr -d ' ' | head -1 || echo "f")

GAMES_TABLE=$(docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d winterjam -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'games');" 2>/dev/null | tr -d ' ' | head -1 || echo "f")

if [ "$GAME_JAMS_TABLE" = "t" ]; then
    print_status "Tabela game_jams" "OK"
else
    print_status "Tabela game_jams" "FAIL"
fi

if [ "$GAMES_TABLE" = "t" ]; then
    print_status "Tabela games" "OK"
else
    print_status "Tabela games" "FAIL"
fi

# Verificar APIs essenciais
echo ""
echo "🔌 Verificando APIs essenciais..."

# API de Game Jams públicos
if curl -s http://localhost:3001/api/public/gamejams > /dev/null 2>&1; then
    GAMEJAMS_COUNT=$(curl -s http://localhost:3001/api/public/gamejams | jq '. | length' 2>/dev/null || echo "unknown")
    print_status "API GameJams" "OK - $GAMEJAMS_COUNT gamejams"
else
    print_status "API GameJams" "FAIL"
fi

# API de Games públicos
if curl -s http://localhost:3001/api/public/games > /dev/null 2>&1; then
    GAMES_COUNT=$(curl -s http://localhost:3001/api/public/games | jq '. | length' 2>/dev/null || echo "unknown")
    print_status "API Games" "OK - $GAMES_COUNT games"
else
    print_status "API Games" "FAIL"
fi

# Verificar Admin Panel
echo ""
echo "🔧 Verificando Admin Panel..."

if curl -s http://localhost:3001/admin > /dev/null 2>&1; then
    print_status "Admin Panel" "OK"
else
    print_status "Admin Panel" "FAIL"
fi

# Verificar Nginx reverse proxy
echo ""
echo "🌐 Verificando Nginx Reverse Proxy..."

# Verificar se o Nginx está a fazer proxy correctamente
NGINX_PROXY_BACKEND=$(curl -s http://localhost/api/health 2>/dev/null | jq -r '.status' 2>/dev/null || echo "fail")
if [ "$NGINX_PROXY_BACKEND" = "ok" ]; then
    print_status "Nginx → Backend" "OK"
else
    print_status "Nginx → Backend" "FAIL"
fi

# Verificar proxy para frontend
if curl -s http://localhost/ > /dev/null 2>&1; then
    print_status "Nginx → Frontend" "OK"
else
    print_status "Nginx → Frontend" "FAIL"
fi

# Verificar logs por erros críticos
echo ""
echo "📋 Verificando logs por erros críticos..."

# Verificar erros no backend (últimos 50 linhas)
BACKEND_ERRORS=$(docker-compose -f docker-compose.prod.yml logs --tail=50 backend 2>/dev/null | grep -i "error\|fatal\|exception" | wc -l || echo "0")
if [ "$BACKEND_ERRORS" -eq "0" ]; then
    print_status "Backend Errors" "OK - Nenhum erro encontrado"
elif [ "$BACKEND_ERRORS" -lt "5" ]; then
    print_status "Backend Errors" "WARN - $BACKEND_ERRORS erros encontrados"
else
    print_status "Backend Errors" "FAIL - $BACKEND_ERRORS erros encontrados"
fi

# Verificar erros no frontend (últimos 50 linhas)
FRONTEND_ERRORS=$(docker-compose -f docker-compose.prod.yml logs --tail=50 frontend 2>/dev/null | grep -i "error\|fatal\|exception" | wc -l || echo "0")
if [ "$FRONTEND_ERRORS" -eq "0" ]; then
    print_status "Frontend Errors" "OK - Nenhum erro encontrado"
elif [ "$FRONTEND_ERRORS" -lt "5" ]; then
    print_status "Frontend Errors" "WARN - $FRONTEND_ERRORS erros encontrados"
else
    print_status "Frontend Errors" "FAIL - $FRONTEND_ERRORS erros encontrados"
fi

# Verificar uso de recursos
echo ""
echo "💻 Verificando recursos do sistema..."

# Docker stats (snapshot)
echo "📊 Uso de recursos dos containers:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" $(docker-compose -f docker-compose.prod.yml ps -q) 2>/dev/null || echo "Não foi possível obter stats dos containers"

# Verificar espaço em disco
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt "80" ]; then
    print_status "Espaço em Disco" "OK - ${DISK_USAGE}% usado"
elif [ "$DISK_USAGE" -lt "90" ]; then
    print_status "Espaço em Disco" "WARN - ${DISK_USAGE}% usado"
else
    print_status "Espaço em Disco" "FAIL - ${DISK_USAGE}% usado"
fi

# Resumo final
echo ""
echo "📋 RESUMO DA VERIFICAÇÃO"
echo "========================"

# Verificar se todos os serviços essenciais estão OK
ESSENTIAL_SERVICES_OK=true

# Verificar containers críticos
for container in "db" "backend" "frontend" "nginx"; do
    if ! docker-compose -f docker-compose.prod.yml ps "$container" | grep -q "Up"; then
        ESSENTIAL_SERVICES_OK=false
        break
    fi
done

# Verificar APIs críticas
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    ESSENTIAL_SERVICES_OK=false
fi

if ! curl -s http://localhost > /dev/null 2>&1; then
    ESSENTIAL_SERVICES_OK=false
fi

if [ "$ESSENTIAL_SERVICES_OK" = true ]; then
    echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}✅ Todos os serviços essenciais estão funcionando${NC}"
    echo ""
    echo "🌍 Acesso aos serviços:"
    echo "   • Website: http://localhost (via Nginx)"
    echo "   • Frontend: http://localhost:3000"
    echo "   • Backend API: http://localhost:3001/api"
    echo "   • Admin Panel: http://localhost:3001/admin"
    echo ""
    echo "📚 Para mais informações: cat DEPLOYMENT.md"
else
    echo -e "${RED}❌ DEPLOYMENT COM PROBLEMAS!${NC}"
    echo -e "${RED}⚠️  Alguns serviços não estão funcionando correctamente${NC}"
    echo ""
    echo "🔧 Próximos passos:"
    echo "   1. Verificar logs: docker-compose -f docker-compose.prod.yml logs"
    echo "   2. Reiniciar serviços: docker-compose -f docker-compose.prod.yml restart"
    echo "   3. Consultar DEPLOYMENT.md para troubleshooting"
fi

echo ""
echo "🔍 Para verificação contínua, execute este script regularmente ou configure monitoring automático."

exit 0
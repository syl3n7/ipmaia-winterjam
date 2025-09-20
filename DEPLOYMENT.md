# 🚀 IPMAIA WinterJam - Guia de Deployment em Produção

Este guia explica como fazer deploy da aplicação IPMAIA WinterJam em produção usando Docker.

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Servidor Linux** (Ubuntu/Debian recomendado)
- **Domínio** configurado (opcional mas recomendado)
- **SSL Certificates** (recomendado para produção)

## 🛠️ Preparação Rápida

### 1. Preparar o Ambiente

```bash
# Executar script de preparação
chmod +x prepare-deploy.sh
./prepare-deploy.sh
```

### 2. Configurar Variáveis de Ambiente

Editar o ficheiro `.env.production`:

```bash
nano .env.production
```

**Variáveis obrigatórias a alterar:**
- `DB_PASSWORD` - Password forte para PostgreSQL
- `JWT_SECRET` - Chave secreta JWT (256+ bits)
- `SESSION_SECRET` - Chave secreta da sessão (256+ bits)
- `ADMIN_PASSWORD` - Password forte para admin
- `FRONTEND_URL` - URL do teu domínio
- `NEXT_PUBLIC_API_URL` - URL da API (domínio/api)

### 3. Deploy

```bash
# Executar deployment
chmod +x deploy-prod.sh
./deploy-prod.sh
```

## 🏗️ Arquitectura de Produção

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │───▶│    Frontend     │    │    Backend      │
│   (Port 80)     │    │   (Port 3000)   │◀──▶│   (Port 3001)   │
│   Reverse Proxy │    │    Next.js      │    │    Express      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (Port 5432)   │
                                               │    Database     │
                                               └─────────────────┘
```

## 🌐 Serviços Disponíveis

Após o deployment, a aplicação estará disponível em:

- **🌍 Website Principal**: `http://your-domain.com` (via Nginx)
- **🖥️ Frontend Directo**: `http://your-domain.com:3000`
- **🔧 API Backend**: `http://your-domain.com:3001/api`
- **⚙️ Admin Panel**: `http://your-domain.com:3001/admin`

## 🔒 Configuração SSL (Recomendado)

### 1. Obter Certificados SSL

**Opção A: Let's Encrypt (Grátis)**
```bash
# Instalar certbot
sudo apt install certbot

# Obter certificado
sudo certbot certonly --standalone -d your-domain.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

**Opção B: Certificado próprio**
```bash
# Colocar certificados na pasta ssl/
mkdir -p ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### 2. Activar HTTPS no Nginx

Editar `nginx.conf` e descomentar a secção HTTPS, depois:

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🔧 Comandos Úteis

### Gestão de Serviços
```bash
# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# Reiniciar serviço
docker-compose -f docker-compose.prod.yml restart [service-name]

# Parar tudo
docker-compose -f docker-compose.prod.yml down

# Parar e remover volumes (CUIDADO: perde dados!)
docker-compose -f docker-compose.prod.yml down --volumes
```

### Base de Dados
```bash
# Aceder à BD
docker-compose -f docker-compose.prod.yml exec db psql -U postgres winterjam

# Backup da BD
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres winterjam > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar BD
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres winterjam
```

### Logs e Monitoring
```bash
# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx

# Usar recursos
docker stats
```

## 🚨 Troubleshooting

### Problema: Serviços não iniciam
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs

# Verificar recursos
docker system df
df -h

# Limpar sistema
docker system prune -f
```

### Problema: Base de dados não conecta
```bash
# Verificar se PostgreSQL está a correr
docker-compose -f docker-compose.prod.yml exec db pg_isready -U postgres

# Verificar logs da BD
docker-compose -f docker-compose.prod.yml logs db
```

### Problema: Frontend não carrega
```bash
# Verificar se API está disponível
curl http://localhost:3001/health

# Verificar variáveis de ambiente
docker-compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC
```

## 🔄 Actualizações

Para actualizar a aplicação:

```bash
# 1. Fazer backup da BD
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres winterjam > backup_before_update.sql

# 2. Parar serviços
docker-compose -f docker-compose.prod.yml down

# 3. Actualizar código (git pull, etc.)
git pull origin main

# 4. Reconstruir e iniciar
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Verificar saúde dos serviços
docker-compose -f docker-compose.prod.yml ps
```

## 📊 Monitoring de Produção

### Health Checks
Os serviços incluem health checks automáticos:
- **Backend**: `http://localhost:3001/health`
- **Frontend**: `http://localhost:3000`
- **Database**: Comando PostgreSQL `pg_isready`

### Logs Importantes
- **Nginx**: Logs de acesso e erro HTTP
- **Backend**: Logs da API e erros da aplicação
- **Frontend**: Logs do Next.js
- **Database**: Logs do PostgreSQL

## 🔐 Segurança

### Configurações Aplicadas
- ✅ Headers de segurança (Nginx)
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Passwords hash (bcrypt)
- ✅ Sessions seguras
- ✅ Containers não-root

### Recomendações Adicionais
- 🔒 Usar HTTPS em produção
- 🛡️ Configurar firewall (UFW)
- 🔄 Backups automáticos regulares
- 📊 Monitoring com logs centralizados
- 🔑 Rotação regular de secrets

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verificar health checks
3. Consultar esta documentação
4. Contactar a equipa de desenvolvimento

---

**🎮 Boa sorte com o teu Game Jam em produção! 🚀**
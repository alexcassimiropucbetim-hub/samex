# Backup e Restauração do SAMEX

Este documento descreve a infraestrutura e o procedimento para gerar e salvar cópias de segurança do banco de dados de produção do sistema SAMEX.

## Arquitetura do Backup

Para contornar as restrições da hospedagem serverless (onde o binário nativo do PostgreSQL não está disponível), o SAMEX utiliza a seguinte arquitetura de backup:

1. **GitHub Actions:** Um workflow isolado (`samex-backup.yml`) executa em um servidor Ubuntu na nuvem.
2. **Supabase CLI:** O workflow utiliza a ferramenta oficial do Supabase para conectar-se ao banco de dados PostgreSQL do SAMEX de forma remota.
3. **Extração Dividida:** O banco de dados é exportado em três estágios para facilitar uma restauração estruturada (`roles`, `schema` e `data`).
4. **Armazenamento em Artifacts:** Os arquivos SQL gerados não são commitados no repositório. Em vez disso, são compactados em um arquivo `.zip` e disponibilizados de forma privada como um "Artifact" de compilação do GitHub Actions, retidos automaticamente por 30 dias.

## Como configurar `SUPABASE_DB_URL`

Para que o GitHub Actions consiga acessar o banco de dados do Supabase para executar o backup, é necessário cadastrar a URL de conexão nos Secrets do repositório:

1. Acesse o painel do seu projeto no Supabase (Project Ref: `pxspavtoxsdmhpgqfdbj`).
2. Vá em **Project Settings** > **Database**.
3. Em "Connection string" (URI), copie a URL de conexão (Substitua `[YOUR-PASSWORD]` pela senha real do banco de dados).
4. Acesse o seu repositório no **GitHub**.
5. Vá em **Settings** > **Secrets and variables** > **Actions**.
6. Clique no botão verde **New repository secret**.
7. Preencha o nome como: `SUPABASE_DB_URL`
8. Cole a URL de conexão do Supabase e clique em **Add secret**.

> **Atenção:** NUNCA compartilhe esta URL e NUNCA coloque ela diretamente no código ou em arquivos versionados como o `.env` de produção no GitHub.

## Execução e Extração

### Como executar o backup manualmente

O backup já é agendado automaticamente todos os dias às **02:00 (Horário de Brasília)**. No entanto, você pode forçar um backup manual a qualquer momento:

1. Acesse a aba **Actions** no seu repositório do GitHub.
2. Na barra lateral esquerda, clique em **SAMEX Database Backup**.
3. No lado direito, clique no botão **Run workflow**.
4. Confirme clicando no botão verde **Run workflow** que aparecerá abaixo.
5. Aguarde o processo finalizar (um ícone verde de check `✓` aparecerá).

### Como baixar o ZIP armazenado (Cópia no PC)

1. Localize e clique na execução específica do workflow na lista da aba **Actions** (após ele ter sido concluído com sucesso).
2. Role a página para baixo até a seção **Artifacts**.
3. Clique sobre o link do arquivo com o nome `samex-backup-[DATA-HORA]`.
4. O download de um arquivo comprimido (ZIP) será iniciado.
5. **Recomendação:** Salve este arquivo em um disco rígido externo, pendrive ou armazenamento em nuvem seguro (como Google Drive). Não o disponibilize em links públicos.

### Como identificar a data do backup

O arquivo baixado e sua pasta interna terão o seguinte formato de nomenclatura:
`samex-backup-YYYY-MM-DD-HHMMSS`
Exemplo: `samex-backup-2026-10-02-050000.zip`
(Lembrando que o carimbo de tempo poderá estar em UTC).

## Conteúdo do Backup

A pasta do backup conterá três arquivos principais:

1. **`roles.sql`**: Contém a definição das roles e perfis globais do PostgreSQL. Necessário se a instância destino for recriada do zero.
2. **`schema.sql`**: Contém toda a estrutura de tabelas, relacionamentos (foreign keys), triggers e funções configuradas no seu banco de dados, sem nenhum dado dentro.
3. **`data.sql`**: Contém todos os registros e dados reais de todas as tabelas, exportados otimizados em modo `--use-copy`.

*(Nota: Como o SAMEX não utiliza o Supabase Auth ou Supabase Storage nativo, mas sim uma tabela própria "Admin", todos os usuários e senhas estão garantidos e copiados de forma segura dentro do arquivo `data.sql`).*

## Restauração (AVISO IMPORTANTE)

**A RESTAURAÇÃO NÃO ESTÁ AUTOMATIZADA NESTE MOMENTO.**

Restaurar dados sobre um banco de produção é um procedimento de alto risco. Nenhum botão no sistema SAMEX atual executa a restauração. Ela deve ser feita manualmente por um administrador de banco de dados diretamente no Supabase, obedecendo à seguinte ordem recomendada em uma nova instância limpa:
1. Executar `roles.sql`
2. Executar `schema.sql`
3. Executar `data.sql`

Nunca execute estes arquivos diretamente no banco do SAMEX sem antes testar exaustivamente em um projeto de testes do Supabase.

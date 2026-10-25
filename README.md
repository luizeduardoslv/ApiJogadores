# API de Jogadores de Futebol

## Sobre o projeto

Este projeto consiste em uma API REST desenvolvida para o gerenciamento de jogadores de futebol, utilizando ASP.NET Core Minimal API.

A aplicação permite listar, buscar, cadastrar, atualizar e remover jogadores. Os dados são armazenados em um banco de dados SQLite, utilizando Entity Framework Core, garantindo que os registros continuem salvos mesmo após o encerramento da aplicação.

O projeto também possui uma interface web integrada, permitindo realizar as operações de gerenciamento diretamente pelo navegador.

Projeto desenvolvido como atividade avaliativa de continuidade da AP1, contemplando persistência de dados, integração entre frontend e backend e testes dos endpoints.

## Tecnologias utilizadas

- C#
- ASP.NET Core
- .NET 10
- Minimal API
- Entity Framework Core
- SQLite
- HTML, CSS e JavaScript
- Bruno

## Como executar

É necessário ter o SDK do .NET 10 instalado.

1. Abra o terminal na pasta do projeto.
2. Restaure as dependências:

```bash
dotnet restore
```

3. Aplique as migrations para criar ou atualizar o banco de dados:

```bash
dotnet ef database update
```

4. Inicie a aplicação:

```bash
dotnet run
```

O terminal mostrará o endereço local em que a aplicação está sendo executada. Acesse esse endereço no navegador para abrir a interface web.

A API utiliza a rota base:

```text
/api/jogadores
```

## Interface web

A interface está localizada na pasta `wwwroot` e é servida pela própria aplicação ASP.NET Core.

Por meio dela, é possível:

- Listar os jogadores cadastrados.
- Cadastrar novos jogadores.
- Editar jogadores existentes.
- Excluir jogadores.
- Visualizar os registros armazenados no banco de dados.

O frontend realiza as requisições HTTP para a API utilizando JavaScript (`fetch`).

## Endpoints

| Método | Rota | Descrição | Retorno esperado |
|---|---|---|---|
| GET | `/api/jogadores` | Lista todos os jogadores | 200 OK |
| GET | `/api/jogadores/{id}` | Busca um jogador pelo ID | 200 OK ou 404 Not Found |
| POST | `/api/jogadores` | Cadastra um jogador | 201 Created |
| PUT | `/api/jogadores/{id}` | Atualiza um jogador | 200 OK ou 404 Not Found |
| DELETE | `/api/jogadores/{id}` | Remove um jogador | 204 No Content ou 404 Not Found |

## Exemplo de cadastro

Requisição:

`POST /api/jogadores`

Corpo JSON:

```json
{
  "nome": "Pedro",
  "numero": 7,
  "posicao": "Ponta"
}
```

## Exemplo de atualização

Requisição:

`PUT /api/jogadores/3`

Corpo JSON:

```json
{
  "nome": "Pedro",
  "numero": 11,
  "posicao": "Ponta Esquerda"
}
```

O ID utilizado no exemplo deve corresponder a um jogador existente no banco de dados.

## Banco de dados e persistência

Os registros são armazenados em um banco de dados SQLite, utilizando o Entity Framework Core.

O contexto do banco está definido em `Data/AppDbContext.cs`, e a entidade `Jogador` representa os dados de cada jogador.

As migrations ficam na pasta `Migrations` e são versionadas no repositório para permitir a criação e atualização da estrutura do banco.

O arquivo local `jogadores.db` não deve ser enviado ao GitHub. Ele é criado localmente quando necessário, a partir das migrations.

Os dados cadastrados permanecem salvos após encerrar e iniciar novamente a aplicação.

## Testes com Bruno

As requisições utilizadas para testar a API estão disponíveis na pasta:

`bruno/`

A Collection permite testar as operações de consulta, cadastro, atualização e exclusão, incluindo as respostas HTTP esperadas e os casos de jogador inexistente.

Para executar os testes, inicie a aplicação e utilize o endereço local informado pelo terminal como base das requisições.

## Compilação

Para verificar se o projeto compila corretamente, execute:

```bash
dotnet build
```

Vídeo de demonstração — AP2
O vídeo apresenta a execução da API de jogadores com persistência em SQLite, a integração com o frontend, os testes das operações CRUD e a manutenção dos dados após reiniciar a aplicação.

Link do vídeo: https://youtu.be/HFUndtP1Kdg
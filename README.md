# API de Jogadores de Futebol

## Sobre o projeto

Este projeto consiste em uma API desenvolvida para realizar o gerenciamento de jogadores de futebol.

A API permite listar, buscar, cadastrar, atualizar e remover jogadores. Os dados são armazenados em memória utilizando uma `List<JogadorDto>`.

Projeto desenvolvido como atividade avaliativa utilizando os conteúdos estudados até a Aula 06.

## Tecnologias utilizadas

- C#
- ASP.NET Core
- .NET 10
- Minimal API
- Bruno

## Como executar

No terminal, dentro da pasta do projeto, execute:

```bash
dotnet run --urls http://localhost:5050
```

A API ficará disponível em:

`http://localhost:5050`

Para verificar se a API está funcionando:

`GET http://localhost:5050/`

## Endpoints

| Método | Rota | Descrição | Retorno |
|---|---|---|---|
| GET | `/` | Verifica se a API está no ar | 200 |
| GET | `/api/jogadores` | Lista todos os jogadores | 200 |
| GET | `/api/jogadores/{id}` | Busca um jogador pelo ID | 200 ou 404 |
| POST | `/api/jogadores` | Cadastra um novo jogador | 201 |
| PUT | `/api/jogadores/{id}` | Atualiza um jogador | 200 ou 404 |
| DELETE | `/api/jogadores/{id}` | Remove um jogador | 204 ou 404 |

## Exemplo de cadastro

Requisição:

`POST /api/jogadores`

JSON:

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

JSON:

```json
{
  "nome": "Pedro",
  "numero": 11,
  "posicao": "Ponta Esquerda"
}
```

## Armazenamento dos dados

Os dados são armazenados somente em memória utilizando uma `List<JogadorDto>`.

Por isso, jogadores cadastrados, atualizados ou removidos durante a execução não são mantidos após a API ser encerrada e iniciada novamente.

## Testes com Bruno

As requisições utilizadas para testar a API estão disponíveis na pasta:

`bruno/`

A Collection possui testes para:

- verificar se a API está no ar;
- listar jogadores;
- buscar jogador por ID;
- cadastrar jogador;
- atualizar jogador;
- remover jogador;
- confirmar a remoção através do retorno 404.

O Environment `Local` utiliza:

`baseUrl = http://localhost:5050`

## Compilação

Para verificar a compilação do projeto:

```bash
dotnet build
```

## Vídeo de demonstração

Link do vídeo:
https://youtu.be/i_Z3Wkktx8E?is=1cVLXo8jDJffj_iz
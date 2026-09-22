var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var jogadores = new List<JogadorDto>
{
    new JogadorDto(1, "Carlos", 10, "Meia"),
    new JogadorDto(2, "Rafael", 9, "Centroavante")
};

app.MapGet("/", () => "API de Jogadores está no ar!");

app.MapGet("/api/jogadores", () =>
{
    return Results.Ok(jogadores);
});

app.MapGet("/api/jogadores/{id:int}", (int id) =>
{
    var jogador = jogadores.Find(jogadorDaLista => jogadorDaLista.Id == id);

    if (jogador is null)
    {
        return Results.NotFound(new { mensagem = "Jogador não encontrado." });
    }

    return Results.Ok(jogador);
});

app.MapPost("/api/jogadores", (JogadorEntradaDto dados) =>
{
    int proximoId = jogadores.Count + 1;

    var novoJogador = new JogadorDto(
        proximoId,
        dados.Nome,
        dados.Numero,
        dados.Posicao
    );

    jogadores.Add(novoJogador);

    return Results.Created($"/api/jogadores/{novoJogador.Id}", novoJogador);
});

app.MapPut("/api/jogadores/{id:int}", (int id, JogadorEntradaDto dados) =>
{
    int indice = jogadores.FindIndex(jogadorDaLista => jogadorDaLista.Id == id);

    if (indice == -1)
    {
        return Results.NotFound(new { mensagem = "Jogador não encontrado." });
    }

    var atualizado = new JogadorDto(
        id,
        dados.Nome,
        dados.Numero,
        dados.Posicao
    );

    jogadores[indice] = atualizado;

    return Results.Ok(atualizado);
});

app.MapDelete("/api/jogadores/{id:int}", (int id) =>
{
    int indice = jogadores.FindIndex(jogadorDaLista => jogadorDaLista.Id == id);

    if (indice == -1)
    {
        return Results.NotFound(new { mensagem = "Jogador não encontrado." });
    }

    jogadores.RemoveAt(indice);

    return Results.NoContent();
});

app.Run();

record JogadorDto(int Id, string Nome, int Numero, string Posicao);
record JogadorEntradaDto(string Nome, int Numero, string Posicao);

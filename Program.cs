using ApiJogadores.Data;
using ApiJogadores.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=jogadores.db"));

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/jogadores", async (AppDbContext db) =>
{
    var jogadores = await db.Jogadores.ToListAsync();

    return Results.Ok(jogadores);
});

app.MapGet("/api/jogadores/{id:int}", async (int id, AppDbContext db) =>
{
    var jogador = await db.Jogadores.FindAsync(id);

    if (jogador is null)
    {
        return Results.NotFound(
            new { mensagem = "Jogador não encontrado." });
    }

    return Results.Ok(jogador);
});

app.MapPost("/api/jogadores", async (
    JogadorEntradaDto dados,
    AppDbContext db) =>
{
    var novoJogador = new Jogador
    {
        Nome = dados.Nome,
        Numero = dados.Numero,
        Posicao = dados.Posicao
    };

    db.Jogadores.Add(novoJogador);

    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/jogadores/{novoJogador.Id}",
        novoJogador);
});

app.MapPut("/api/jogadores/{id:int}", async (
    int id,
    JogadorEntradaDto dados,
    AppDbContext db) =>
{
    var jogador = await db.Jogadores.FindAsync(id);

    if (jogador is null)
    {
        return Results.NotFound(
            new { mensagem = "Jogador não encontrado." });
    }

    jogador.Nome = dados.Nome;
    jogador.Numero = dados.Numero;
    jogador.Posicao = dados.Posicao;

    await db.SaveChangesAsync();

    return Results.Ok(jogador);
});

app.MapDelete("/api/jogadores/{id:int}", async (
    int id,
    AppDbContext db) =>
{
    var jogador = await db.Jogadores.FindAsync(id);

    if (jogador is null)
    {
        return Results.NotFound(
            new { mensagem = "Jogador não encontrado." });
    }

    db.Jogadores.Remove(jogador);

    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();

record JogadorEntradaDto(string Nome, int Numero, string Posicao);

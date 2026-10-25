namespace ApiJogadores.Models;

public class Jogador
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public int Numero { get; set; }

    public string Posicao { get; set; } = string.Empty;
}
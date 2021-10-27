import torch
import torch.nn as nn


class LSTMGenerator(nn.Module):
    """An LSTM based generator. It expects a sequence of noise vectors as input.

    Args:
        in_dim: Input noise dimensionality
        out_dim: Output dimensionality
        n_layers: number of lstm layers
        hidden_dim: dimensionality of the hidden layer of lstms

    Input: noise of shape (batch_size, seq_len, in_dim)
    Output: sequence of shape (batch_size, seq_len, out_dim)
    """

    def __init__(self, in_dim, out_dim, hidden_dim=256, n_layers=1, device=None):
        super().__init__()
        self.device = device
        self.n_layers = n_layers
        self.hidden_dim = hidden_dim
        self.out_dim = out_dim

        h0_dim = hidden_dim // 4
        h1_dim = hidden_dim // 2
        h2_dim = hidden_dim

        self.lstm0 = nn.LSTM(in_dim, h0_dim, n_layers, batch_first=True)
        self.lstm1 = nn.LSTM(h0_dim, h1_dim, n_layers, batch_first=True)
        self.lstm2 = nn.LSTM(h1_dim, h2_dim, n_layers, batch_first=True)

        self.linear = nn.Sequential(nn.Linear(h2_dim, out_dim), nn.Tanh())

    def forward(self, input):
        h0_dim = self.hidden_dim // 4
        batch_size, seq_len = input.size(0), input.size(1)

        h_0 = torch.zeros(self.n_layers, batch_size, h0_dim).to(self.device)
        c_0 = torch.zeros(self.n_layers, batch_size, h0_dim).to(self.device)

        recurrent_features, _ = self.lstm0(input, (h_0, c_0))
        recurrent_features, _ = self.lstm1(recurrent_features)
        recurrent_features, _ = self.lstm2(recurrent_features)

        outputs = self.linear(
            recurrent_features.contiguous().view(batch_size * seq_len, self.hidden_dim)
        )
        outputs = outputs.view(batch_size, seq_len, self.out_dim)

        return outputs


class LSTMDiscriminator(nn.Module):
    """An LSTM based discriminator. It expects a sequence as input and outpus a probability for each element.

    Args:
        in_dim: Input noise dimensionality
        n_layers: number of lstm layers
        hidden_dim: dimensionality of the hidden layer of lstms
        device: device for running model (ex. cuda / cpu)

    Input: noise of shape (batch_size, seq_len, in_dim)
    Output: sequence of shape (batch_size, seq_len, 1)
    """

    def __init__(self, in_dim, hidden_dim=256, n_layers=1, device=None):
        super().__init__()
        self.device = device
        self.n_layers = n_layers
        self.hidden_dim = hidden_dim
        self.in_dim = in_dim

        self.lstm = nn.LSTM(in_dim, hidden_dim, n_layers, batch_first=True)
        self.linear = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())

    def forward(self, input):
        batch_size, seq_len = input.size(0), input.size(1)
        h_0 = torch.zeros(self.n_layers, batch_size, self.hidden_dim).to(self.device)
        c_0 = torch.zeros(self.n_layers, batch_size, self.hidden_dim).to(self.device)

        recurrent_features, _ = self.lstm(input, (h_0, c_0))
        outputs = self.linear(
            recurrent_features.contiguous().view(batch_size * seq_len, self.hidden_dim)
        )
        outputs = outputs.view(batch_size, seq_len, 1)

        return outputs.to(self.device)


if __name__ == "__main__":
    batch_size = 16
    seq_len = 32
    noise_dim = 100
    seq_dim = 4

    gen = LSTMGenerator(noise_dim, seq_dim)
    dis = LSTMDiscriminator(seq_dim)
    noise = torch.randn(8, 16, noise_dim)
    gen_out = gen(noise)
    dis_out = dis(gen_out)

    print("Noise: ", noise.size())
    print("Generator output: ", gen_out.size())
    print("Discriminator output: ", dis_out.size())

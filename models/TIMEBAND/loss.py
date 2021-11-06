import torch
import torch.nn as nn


class GANLoss(nn.Module):
    def __init__(self, gan_mode="vanilla", real_label=0.9, fake_label=0.1):
        """
        Initialize the GANLoss class.
        Parameters:
            gan_mode (str) - - the type of GAN objective. It currently supports vanilla, lsgan, and wgangp.
            target_real_label (bool) - - label for a real image
            target_fake_label (bool) - - label of a fake image
        Note: Do not use sigmoid as the last layer of Discriminator.
        LSGAN needs no sigmoid. vanilla GANs will handle it with BCEWithLogitsLoss.
        """
        super(GANLoss, self).__init__()
        self.gan_mode = gan_mode
        self.register_buffer("real_label", torch.tensor(real_label))
        self.register_buffer("fake_label", torch.tensor(fake_label))
        self.loss = nn.MSELoss()

    def get_target_tensor(self, prediction: torch.tensor, target_is_real: bool):
        """Create label tensors with the same size as the input.
        Parameters:
            prediction (tensor) - - tpyically the prediction from a discriminator
            target_is_real (bool) - - if the ground truth label is for real images or fake images
        Returns:
            A label tensor filled with ground truth label, and with the size of the input
        """

        target_tensor = self.real_label if target_is_real else self.fake_label
        return target_tensor.expand_as(prediction)

    def __call__(self, prediction: torch.tensor, target_is_real: bool):
        """Calculate loss given Discriminator's output and grount truth labels.
        Parameters:
            prediction   (tensor) - - typically the prediction output from a discriminator
            target_is_real (bool) - - if the ground truth label is for real images or fake images
        Returns:
            the calculated loss.
        """

        if self.gan_mode in ["lsgan", "vanilla"]:
            target_tensor = self.get_target_tensor(prediction, target_is_real)
            target_tensor = target_tensor.to(prediction.device)
            loss = self.loss(prediction, target_tensor)

        elif self.gan_mode in ["wgangp"]:
            loss = -prediction.mean() if target_is_real else prediction.mean()

        return loss


class TIMEBANDLoss:
    def __init__(self, config: dict):
        # Set configuration
        self.set_config(config)

        # Critetion
        device = self.device
        self.criterion_l1n = nn.SmoothL1Loss().to(device)
        self.criterion_l2n = nn.MSELoss().to(device)
        self.criterion_adv = GANLoss(real_label=0.9, fake_label=0.1).to(device)
        self.criterion_gp = GANLoss("wgangp", real_label=0.9, fake_label=0.1).to(device)

        # Generator Loss
        self.init_loss()

    def set_config(self, config: dict):
        """
        Configure settings related to the data set.

        params:
            config: Dataset configuration dict
                `config['core'] & config['dataset']`
        """
        self.__dict__ = {**config, **self.__dict__}

    def init_loss(self):
        # Discriminator loss
        self.errD_real = 0
        self.errD_fake = 0
        self.errD_GP = 0

        # Generator loss
        self.err_Gen = 0
        self.errG_l1 = 0
        self.errG_l2 = 0
        self.errG_GP = 0

        return self.loss()

    def gen_loss(self, true, pred, DGx):
        errG = self.GANloss(DGx, target_is_real=False)
        errl1 = self.l1loss(true, pred)
        errl2 = self.l2loss(true, pred)
        errG_GP = self.grad_penalty(true, pred)

        self.err_Gen += errG
        self.errG_l1 += errl1
        self.errG_l2 += errl2
        self.errG_GP += errG_GP

        return errG + errl1 + errl2 + errG_GP

    def dis_loss(self, true, pred, Dy, DGx, critic: bool = False):
        if critic:
            errD_real = self.WGANloss(Dy, target_is_real=True)
            errD_fake = self.WGANloss(DGx, target_is_real=False)
            errD_GP = self.grad_penalty(true, pred)

            return errD_fake + errD_real + errD_GP
        else:
            errD_real = self.GANloss(Dy, target_is_real=True)
            errD_fake = self.GANloss(DGx, target_is_real=False)

            self.errD_real += errD_real
            self.errD_fake += errD_fake
            return errD_fake + errD_real

    def GANloss(self, D, target_is_real):
        return self.criterion_adv(D, target_is_real)

    def WGANloss(self, D, target_is_real):
        return self.criterion_gp(D, target_is_real)

    def l1loss(self, true, pred):
        return self.l1_weight * self.criterion_l1n(pred, true)

    def l2loss(self, true, pred):
        return self.l2_weight * self.criterion_l2n(pred, true)

    def grad_penalty(self, true, pred):
        return self.gp_weight * self._grad_penalty(true, pred)

    def _grad_penalty(self, true, pred):
        gradient_sqr = torch.square(true - pred)
        gradient_sqr_sum = torch.sum(gradient_sqr)
        gradient_l2_norm = torch.sqrt(gradient_sqr_sum)
        gradient_penalty = torch.square(1 - gradient_l2_norm) / true.size(0)
        return gradient_penalty

    def loss(self, i: int = 0):
        errG = self.err_Gen + self.errG_l1 + self.errG_l2 + self.errG_GP
        errD = self.errD_fake + self.errD_real

        losses = {
            "D": f"{errD  / (i + 1):6.3f}",
            "R": f"{self.errD_real  / (i + 1):6.3f}",
            "F": f"{self.errD_fake  / (i + 1):6.3f}",
            "G": f"{errG / (i + 1):6.3f}",
            "G_": f"{self.err_Gen / (i + 1):6.3f}",
            "L1": f"{self.errG_l1 / (i + 1):6.3f}",
            "L2": f"{self.errG_l2 / (i + 1):6.3f}",
            "GP": f"{self.errG_GP / (i + 1):6.3f}",
        }
        return losses

# Timeband

<div align="center">
    <img src="imgs\timeband.jpg">
</div>

**Timeband** is an LSTM-GAN based model for simultaneous detection and correction of missing and outliers in multivariate time series data.

``` 
Step 1. Setting up configuration
Step 2. Prepare Time series Dataset
Step 3. Process the Time series Dataset
    - Preprocess with Normalizing / Scaling / ...
    - Process with Holdout / Windowing / ...  
Step 4. Prepare Input/Output Data Structure
    Real Dataset => Encoder => Context Space => Decoder => Target Dataset
Step 5. Train the LSTM-GAN based model
Step 6. Evaluate the models
Step 7. Get the outputs
```


---
## Installation

### Requirements
* Nvidia device with CUDA

* Python 3.8+ 
   
  [Download here](https://www.python.org/downloads/)
* PyTorch 1.9+

  [Download here](https://pytorch.org/)
* Numpy / pandas / ...
  
  Download by `pip install -r requirements.txt`

## Code installation

1. Create a virtual environment.
    ```py
    python -m venv .venv
    ```

2. Install PyTorch
   ```py
   pip install torch==1.9.0 
   or 
   pip install torch==1.9.1+cu111 -f https://download.pytorch.org/whl/torch_stable.html
   ```

3. Get Timeband
   ```shell
   git clone https://github.com/handal95/Timeband.git
   ```

4. Install Python packages
    ```py
    pip install -r requirements.txt 
    ```

5. Set Default configuration
   - copy `config.sample.json` to `config.json`

import pickle
from libs.models.launcher import main

if __name__ == "__main__":
    # main()

    CORE_PATH = "models/sample.pkl"
    with open(CORE_PATH, mode="rb") as f:
        model = pickle.load(f)

    line, band = model.predicts()
    print(line)
    print(band)

    # main()

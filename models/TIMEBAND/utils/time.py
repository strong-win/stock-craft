import pandas as pd


def time_cycle(data: pd.DataFrame, dt: pd.Series, value: int, name: str, cycle=True):

    if cycle:
        value = value / 2
        time_info = 2 * (abs(value - dt) / value) - 1
    else:
        time_info = 2 * (abs(value - dt) / value) - 1

    info = pd.DataFrame({name: time_info})
    info.index = data.index
    return pd.concat([data, info], axis=1)

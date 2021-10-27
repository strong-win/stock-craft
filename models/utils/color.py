COLORS = [
    "red",
    "green",
    "deepskyblue",
    "orange",
    "blue",
    "purple",
    "peru",
    "wheat",
    "lime",
    "aqua",
    "indigo",
    "pink",
    "grey",
    "saddlebrown",
    "darkkhaki",
    "olivedrab",
    "teal",
    "skyblue",
    "royalblue",
    "pink",
    "silver",
    "yellow",
    "darkseagreen",
    "violet",
    "darkred",
]


def colorstr(*input):
    # Colors a string https://en.wikipedia.org/wiki/ANSI_escape_code, i.e.  colorstr('blue', 'hello world')
    # color arguments, string
    *args, string = input if len(input) > 1 else ("blue", "bold", input[0])
    colors = {
        "black": "\033[30m",  # basic colors
        "red": "\033[31m",
        "green": "\033[32m",
        "yellow": "\033[33m",
        "blue": "\033[34m",
        "magenta": "\033[35m",
        "cyan": "\033[36m",
        "white": "\033[37m",
        "bright_black": "\033[90m",  # bright colors
        "bright_red": "\033[91m",
        "bright_green": "\033[92m",
        "bright_yellow": "\033[93m",
        "bright_blue": "\033[94m",
        "bright_magenta": "\033[95m",
        "bright_cyan": "\033[96m",
        "bright_white": "\033[97m",
        "end": "\033[0m",  # misc
        "bold": "\033[1m",
        "underline": "\033[4m",
    }
    return "".join(colors[x] for x in args) + f"{string}" + colors["end"]

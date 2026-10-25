from . import generate

def main() -> None:
    blocs = [
        (0, 10, "#DB8D34C9"),
        (0, 20, "#f43232"),
        (0, 40, "#423E6B"),
        (1, 60, "#34DB58C8"),
        (1, 5, "#2ba30d"),
    ]

    generate.print_chromos(blocs, block_gap=1, height=10, export="png")

import argparse

from . import generate


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate un figure of chromosoms from a CSV file."
    )
    parser.add_argument("csv_file", help="Path to CSV")
    parser.add_argument(
        "--block-gap",
        type=float,
        default=1,
        help="Space between blocks (default : 1)",
    )
    parser.add_argument(
        "--height",
        type=float,
        default=10,
        help="Height of the blocks (default : 10)",
    )
    parser.add_argument(
        "--export",
        choices=("png", "svg"),
        default="png",
        help="Format of the figure (défaut : png)",
    )

    args = parser.parse_args()

    generate.print_chromos(
        args.csv_file,
        block_gap=args.block_gap,
        height=args.height,
        export=args.export,
    )

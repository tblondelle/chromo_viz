"""
Generate a picture of chromosomes.
"""

from typing import Dict

import csv
from pathlib import Path
import matplotlib.pyplot as plt


def prepare_data(chromos_file: str) -> Dict :
    """
    Transform CSV user-input into usable Python data.
    """

    chromosome_data = []

    with open(chromos_file, mode='r', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter=";")

        # Ignore first line.
        next(reader)

        for row in reader:
            new_row = (int(row[0]), int(row[1]), row[2])
            chromosome_data.append(new_row)

    chromosome_data.sort(key=lambda x: x[0])

    new_dict = {}
    for ligne in chromosome_data:
        if ligne[0] not in new_dict:
            new_dict[ligne[0]] = [ligne[1:]]
        else:
            new_dict[ligne[0]].append(ligne[1:])
    return new_dict


def get_stats(chromos_file):
    chromos = prepare_data(chromos_file)
    for chromo_id, value in chromos.items():
        total_size = sum(block[0] for block in value)
        print(f"The size of the chromosome {chromo_id} is {total_size}.")


def print_chromos(
    chromos_file: str,
    chromo_gap: int = 10,
    block_gap: int = 0,
    height: int = 10,
    export: str = "png",
) -> None:
    """
    Generate a block representation of chromosome sequence.

    Args:
        chromos_file: A CSV file listing each block. One block is a tuple : chromosome_number,
          size, block color, like "0 ; 23 ; #DB8D34C9".
        chromo_gap: The size of the (vertical) gap between chromosomes.
        block_gap: The size of the (horizontal) gap beween blocks.
        height: The (vertical) size of the block.
        export: The format in which the figure is saved. Only "png" and "svg" are allowed.
    """

    chromos = prepare_data(chromos_file)

    fig, ax = plt.subplots()
    ax.set_aspect("equal", adjustable="box")

    for spine in ax.spines.values():
        spine.set_visible(False)

    y_cursor = 0
    xlim = 0
    for _, single_chromo in chromos.items():

        x_cursor = 0
        for block in single_chromo:
            ax.barh(
                y=y_cursor,
                width=block[0],
                left=x_cursor,
                color=block[1],
                edgecolor=None,
                height=height,
            )
            x_cursor += block[0] + block_gap

            xlim = max(xlim, x_cursor)

        y_cursor += height + chromo_gap

    ax.set_xlim(0, xlim)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.invert_yaxis()

    if export not in {"png", "svg"}:
        raise ValueError("export doit être 'png' ou 'svg'.")

    base_name = Path(chromos_file).stem
    output_dir = Path("output")
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = output_dir / f"{base_name}.{export}"

    fig.savefig(
        filename,
        format=export,
        bbox_inches="tight",
        **({"dpi": 150} if export == "png" else {}),
    )

    get_stats(chromos_file)

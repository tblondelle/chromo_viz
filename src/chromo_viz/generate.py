"""
Generate a picture of chromosoms.
"""

from typing import List, Dict
import matplotlib.pyplot as plt


def prepare_data(chromosome_data: List[List]) -> Dict :
    """
    Transform CSV-like user-input into usable Python data.
    """

    chromosome_data.sort(key=lambda x: x[0])

    new_dict = {}
    for ligne in chromosome_data:
        if ligne[0] not in new_dict:
            new_dict[ligne[0]] = [ligne[1:]]
        else:
            new_dict[ligne[0]].append(ligne[1:])
    return new_dict


def print_chromos(
    chromos,
    chromo_gap: int = 20,
    block_gap: int = 0,
    height: int = 10,
    export = "png",
) -> None:
    """
    Generate a block representation of chromosome sequence.

    Args:
        chromos: A list of each block. One block is a tuple : chromosome_number,
          size, block color. Eg: (0, 23, "#DB8D34C9").
        chromo_gap: The size of the (vertical) gap between chromosoms.
        block_gap: The size of the (horizontal) gap beween blocks.
        height: The (vertical) size of the block.
        export: The format in which the figure is saved. Only "png" and "svg" are allowed.
    """

    chromos = prepare_data(chromos)

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
    if export == "png":
        plt.savefig("graphe.png", dpi=150, bbox_inches="tight")
    elif export == "svg":
        fig.savefig("graphe.svg", format="svg", bbox_inches="tight")
    else:
        raise Exception("The 'export' argument should either be 'png' or 'svg'.")

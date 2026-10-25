# Visualisation of chromosomes

Display chromosomes in a block way from simple user input.

From
```csv
chromosome_number;size;color
0;10;#DB8D34C9
0;20;#f43232
0;40;#423E6B
1;60;#34DB58C8
1;5;#2ba30d
```
To

![2 chromosomes](/example.png "Example")

## Installation


From a shell:
```bash
uv init
uv add git+https://github.com/tblondelle/chromo_viz.git
```

## Usage


1. Import your CSV in `input` folder.
2. Run the following command.

```shell
uv run chromo_viz input/data.csv
```

3. Learn how to adjust the figure :

```shell
usage: chromo_viz [-h] [--chromo-gap CHROMO_GAP] [--block-gap BLOCK_GAP] [--height HEIGHT] [--export {png,svg}] csv_file

Generate a figure of chromosomes from a CSV file.

positional arguments:
  csv_file              Path to CSV

options:
  -h, --help            show this help message and exit
  --chromo-gap CHROMO_GAP
                        Space between chromosomes (default : 20)
  --block-gap BLOCK_GAP
                        Space between blocks (default : 1)
  --height HEIGHT       Height of the blocks (default : 10)
  --export {png,svg}    Format of the figure (default : png)
```

4. Adjust the parameters using the command line parameters.

```shell
# For instance
uv run chromo_viz input/data.csv --chromo-gap 2 --height 2 --export svg
```


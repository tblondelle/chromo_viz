# Visualisation of chromosoms

Display chromosoms in a block way from simple user input.

From
```csv
(0, 10, "#DB8D34C9"),
(0, 20, "#f43232"),
(0, 40, "#423E6B"),
(1, 60, "#34DB58C8"),
(1, 5, "#2ba30d"),
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


1. Modify the data in `src/chromo_viz/__init__.py`
2. Adjust the parameter in the same file.
3. Run the following command.

```python
uv run chromo_viz
```
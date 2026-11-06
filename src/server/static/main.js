const width = 500;
const labelWidth = 30;
const labelMargin = 10;
const topMargin = 3;

let data_state = []
let state_position = 0;
let data = [];
let selectedBlock = null;
let nextBlockId = 0
let x = null;

const rightMenu = document.querySelector("#right-menu");
const colorPicker = document.querySelector("#color-picker");
const fileInput = document.querySelector("#csv-file");
const gapInput = document.querySelector("#gap");
const heightInput = document.querySelector("#bar-height");
const rowGapInput = document.querySelector("#row-gap");

function save(new_data_state) {
    // If trying to save the same state, don't.
    if (data_state.length >= 1) {
        if (data_state[state_position].length === new_data_state.length &&
            data_state[state_position].every((item, i) =>
                data_state[state_position][i].row_nb === new_data_state[i].row_nb &&
                data_state[state_position][i].seq_nb === new_data_state[i].seq_nb &&
                data_state[state_position][i].color === new_data_state[i].color &&
                data_state[state_position][i].size === new_data_state[i].size
            )) {
            return
        }
    }

    data_state.splice(state_position + 1, data_state.length - state_position, structuredClone(new_data_state));

    state_position = data_state.length - 1

    if (state_position == 0) {
        document.querySelector(".undo-button").disabled = true;
    }
    else {
        document.querySelector(".undo-button").disabled = false;
    }
    if (state_position == data_state.length - 1) {
        document.querySelector(".redo-button").disabled = true;
    }
    else {
        document.querySelector(".redo-button").disabled = false;
    }
}

function load(position) {
    data = structuredClone(data_state[position]);
}


function draw(withAnimation = true) {

    if (data.length === 0) return;

    const gap = +gapInput.value;
    const barHeight = +heightInput.value;
    const rowGapBp = +rowGapInput.value * barHeight;

    // Update the displayed values for gap, bar height, and row gap.
    document.querySelector("#gap-value").textContent = gap;
    document.querySelector("#height-value").textContent = barHeight;
    document.querySelector("#row-gap-value").textContent = (rowGapBp / barHeight).toFixed(1);

    // Enrich data with x and y.
    data.sort((a, b) =>
        a.row_nb - b.row_nb || a.seq_nb - b.seq_nb
    );
    var previousSeq;
    data.forEach(seq => {
        if (seq.row_nb !== previousSeq?.row_nb) {
            previousSeq = null;
        }
        seq.x = previousSeq ? previousSeq.x + previousSeq.size + gap : 0;
        seq.y = topMargin + seq.row_nb * (barHeight + rowGapBp);
        previousSeq = seq;
    });

    // Create chromosomeTotals
    const nbChromosomes = d3.max(data, d => d.row_nb) + 1;
    var chromosomeTotals = [];
    for (let chrNumber = 0; chrNumber < nbChromosomes; chrNumber++) {
        chromosomeTotals.push({
            row_nb: chrNumber,
            total: d3.sum(
                data.filter(d => d.row_nb === chrNumber),
                d => d.size
            ),
            totalX: d3.max(
                data.filter(d => d.row_nb === chrNumber),
                d => d.x + d.size
            )
        });
    }

    const maxTotal = d3.max(chromosomeTotals, d => d.totalX);

    x = d3.scaleLinear()
        .domain([0, maxTotal || 1])
        .range([0, width - labelWidth - labelMargin]);

    const height = topMargin + nbChromosomes * (barHeight + rowGapBp) - rowGapBp;

    // Drawing time.
    const svg = d3.select("#chart")
        .selectAll("svg")
        .data([null])
        .join("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%")
        .style("height", "auto");

    svg.selectAll("text.chromosome-label")
        .data(chromosomeTotals, d => d.row_nb)
        .join(
            enter => enter.append("text")
                .attr("x", width - labelWidth)
                .attr("class", "chromosome-label")
                .attr("y", d =>
                    topMargin + d.row_nb * (barHeight + rowGapBp) + barHeight / 2
                )
                .attr("dy", "0.35em")
                .text(d => `${d.total}bp`),
            update => update
                .transition()
                .duration(withAnimation ? 200 : 20)
                .attr("y", d =>
                    topMargin + d.row_nb * (barHeight + rowGapBp) + barHeight / 2
                )
                .attr("dy", "0.35em")
                .text(d => `${d.total}bp`),
            exit => exit
                .remove()
        );

    svg.selectAll("rect.block")
        .data(data, d => d.id)
        .join(
            enter => enter.append("rect")
                .attr("class", "block")
                .attr("x", d => x(d.x))
                .attr("y", d => d.y)
                .attr("width", d => x(d.size))
                .attr("height", barHeight)
                .attr("fill", d => d.color)
                .style("cursor", "pointer")
                .on("click", (event, d) => {
                    selectedBlock = d;
                    rightMenu.hidden = false;

                    rightMenu.style.position = "fixed";

                    const margin = 10;
                    const x = event.clientX + margin;
                    const y = event.clientY + margin;

                    const maxX = window.innerWidth - rightMenu.offsetWidth - margin;
                    const maxY = window.innerHeight - rightMenu.offsetHeight - margin;

                    rightMenu.style.left = `${Math.max(margin, Math.min(x, maxX))}px`;
                    rightMenu.style.top = `${Math.max(margin, Math.min(y, maxY))}px`;

                })
                .call(enter => enter
                    .attr("width", 0)
                    .attr("x", d => x(d.x + d.size / 2))
                    .attr("height", 0)
                    .attr("y", d => d.y + barHeight / 2)
                    .transition()
                    .duration(withAnimation ? 200 : 20)
                    .attr("width", d => x(d.size))
                    .attr("x", d => x(d.x))
                    .attr("height", barHeight)
                    .attr("y", d => d.y)
                ),

            update => update
                .transition()
                .duration(withAnimation ? 200 : 20)
                .attr("x", d => x(d.x))
                .attr("y", d => d.y)
                .attr("height", barHeight)
                .attr("width", d => x(d.size))
                .attr("fill", d => d.color),

            exit => exit
                .transition()
                .duration(withAnimation ? 200 : 20)
                .attr("height", 0)
                .attr("width", 0)
                .attr("x", function (d) {
                    const sameRow = data
                        .filter(block => block.row_nb === d.row_nb)
                        .sort((a, b) => a.x - b.x);

                    const previous = sameRow.filter(block => block.x < d.x).at(-1);
                    const next = sameRow.find(block => block.x >= d.x);

                    const previousX = previous ? x(previous.x + previous.size + gap) : 0;
                    const nextX = next ? x(next.x) : previousX;

                    return (previousX + nextX) / 2;
                })
                .remove()
        );

    svg.selectAll("rect.block").selectAll("title")
        .data(d => [d])
        .join("title")
        .text(d =>
            `Size: ${d.size}`
        );
}


function loadCsvText(text) {

    const header = text.split(/\r?\n/).find(line => line.trim() !== "") ?? "";

    if (header.includes("\t")) {
        throw new Error(
            "File data.csv is split by tabs. " +
            "Please rather use semi-colon separator."
        );
    }

    var previousChromosomeNumber = -1;
    var seq_nb = 0;

    data = d3.dsvFormat(";").parse(text, d => {

        if (!Number.isInteger(+d.chromosome_number) || Number(+d.chromosome_number) < 0) {
            throw new Error("Chromosome should be a positive integer." + d);
        }

        // Check size is integer.
        if (!Number.isInteger(+d.size) || Number(+d.size) < 0) {
            throw new Error("Size should be a positive integer.");
        }

        // Check color has the right format.
        const isHexColor = /^#[0-9A-Fa-f]{6}$/.test(d.color);
        if (!isHexColor) {
            throw new Error("Expected a color in #RRGGBB format.");
        }

        // Check order of chromosomes
        if (Number(+d.chromosome_number) < previousChromosomeNumber) {
            throw new Error("Chromosomes are not ordered in file.");
        }

        // Reset sequence number for new chromosome.
        if (Number(d.chromosome_number) == previousChromosomeNumber) {
            seq_nb++;
        }
        else if (Number(d.chromosome_number) == previousChromosomeNumber + 1) {
            seq_nb = 0;
        }
        else {
            throw new Error("Chromosomes number are not consecutive in file. First chromosome should be 0, then 1, then 2, etc.");
        }

        var line = {
            id: nextBlockId++,
            row_nb: Number(+d.chromosome_number),
            seq_nb: seq_nb,
            size: +d.size,
            color: d.color,
        }

        previousChromosomeNumber = Number(+d.chromosome_number);

        return line
    });

    draw();
    save(data);
}


// Initial load
fetch("src/server/static/data.csv")
    .then(response => {
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        return response.text();
    })
    .then(loadCsvText)
    .catch(error => {
        console.error("Impossible to load CSV file:", error);
        alert("The default CSV file could not be loaded.\n" + error);
    });


// Listeners
const dialog = document.querySelector("#about-dialog");

document.querySelector("#about").addEventListener("click", () => {
    dialog.showModal();
});

dialog.querySelector(".close-button").addEventListener("click", () => {
    dialog.close();
});


document.querySelector("#export-csv").addEventListener("click", () => {
    if (data.length === 0) {
        alert("No data to export. First load a CSV file.");
        return;
    }

    const rows = [["chromosome_number", "size", "color"]];

    data.sort((a, b) => a.row_nb - b.row_nb || a.seq_nb - b.seq_nb);
    data.forEach(d => {
        rows.push([d.row_nb, d.size, d.color]);
    });

    const csv = rows
        .map(row_nb => row_nb.map(value => String(value ?? ""))
            .join(";"))
        .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ChromoViz.csv";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.querySelector("#export-svg").addEventListener("click", () => {
    const svg = document.querySelector("#chart svg");

    if (!svg) {
        alert("No graph to export.");
        return;
    }

    const contenu = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([contenu], {
        type: "image/svg+xml;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = "ChromoViz.svg";
    lien.click();

    URL.revokeObjectURL(url);
});

document.querySelector("#load-csv").addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        loadCsvText(await file.text());
    } catch (error) {
        console.error("Can't read the CSV :", error);
        alert("The CSV file could not be read. \n" + error);
    }
});

gapInput.addEventListener("input", () => draw(false));

heightInput.addEventListener("input", () => draw(false));

rowGapInput.addEventListener("input", () => draw(false));


// Menus
document.addEventListener("click", event => {
    if (
        !event.target.closest("#right-menu") &&
        !event.target.closest("#chart svg rect")
    ) {
        rightMenu.hidden = true;
    }
});

colorPicker.addEventListener("input", () => {
    if (!selectedBlock) return;

    selectedBlock.color = colorPicker.value;
    draw(false);
});

document.querySelector("#edit-color").addEventListener("click", () => {
    if (!selectedBlock) return;

    colorPicker.value = /^#[0-9a-f]{6}$/i.test(selectedBlock.color)
        ? selectedBlock.color
        : "#000000";

    rightMenu.hidden = true;
    colorPicker.click();
    save(data);
});

document.querySelector("#edit-size").addEventListener("click", () => {
    if (!selectedBlock) return;

    const value = prompt("New size:", selectedBlock.size);

    if (value === null) return;
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        alert("Please enter a size greater than 0.");
        return;
    }

    selectedBlock.size = size;
    draw();
    rightMenu.hidden = true;
    save(data);
});

document.querySelector("#remove-seq").addEventListener("click", () => {
    if (!selectedBlock) return;

    if (data.length === 1) {
        alert("The graph must contain at least one sequence.");
        return;
    }

    const index = data.findIndex(d => d.id === selectedBlock.id);
    if (index === -1) return;

    // Remove sequence
    data.splice(index, 1);

    if (data.filter(d => d.row_nb === selectedBlock.row_nb).length === 0) {
        // Renumber the chromosomes
        data.forEach(d => {
            if (d.row_nb > selectedBlock.row_nb) {
                d.row_nb--;
            }
        });
    }
    else {
        // Renumber sequence
        data.filter(d => d.row_nb === selectedBlock.row_nb)
            .forEach(d => {
                if (d.seq_nb >= selectedBlock.seq_nb) {
                    d.seq_nb--;
                }
            })
    }

    selectedBlock = null;

    draw();
    rightMenu.hidden = true;
    save(data);
});

document.querySelector("#add-before").addEventListener("click", () => {
    if (!selectedBlock) return;

    const value = prompt("New size:", selectedBlock.size);
    if (value === null) return;

    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        alert("Please enter a size greater than 0.");
        return;
    }

    // Create the new element
    const newSequence = {
        id: nextBlockId++,
        row_nb: selectedBlock.row_nb,
        seq_nb: selectedBlock.seq_nb,
        size,
        color: selectedBlock.color
    };

    // Renumber the seq_nb of the following blocks in the same chromosome
    data.filter(d => d.row_nb === selectedBlock.row_nb)
        .forEach(d => {
            if (d.seq_nb >= selectedBlock.seq_nb) {
                d.seq_nb++;
            }
        })

    // Insert the new element before the selected block
    const index = data.findIndex(d => d.id === selectedBlock.id);
    if (index === -1) return;

    data.splice(index, 0, newSequence);

    draw();
    rightMenu.hidden = true;
    save(data);
});

document.querySelector("#add-after").addEventListener("click", () => {
    if (!selectedBlock) return;

    const value = prompt("New size:", selectedBlock.size);
    if (value === null) return;

    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        alert("Please enter a size greater than 0.");
        return;
    }

    // Create the new element
    const newSequence = {
        id: nextBlockId++,
        row_nb: selectedBlock.row_nb,
        seq_nb: selectedBlock.seq_nb + 1,
        size,
        color: selectedBlock.color
    };

    // Renumber the seq_nb of the following blocks in the same chromosome
    data.filter(d => d.row_nb === selectedBlock.row_nb)
        .forEach(d => {
            if (d.seq_nb > selectedBlock.seq_nb) {
                d.seq_nb++;
            }
        })

    // Insert the new element before the selected block
    const index = data.findIndex(d => d.id === selectedBlock.id);
    if (index === -1) return;

    data.splice(index + 1, 0, newSequence);

    draw();
    rightMenu.hidden = true;
    save(data);
});

document.querySelector("#remove-chr").addEventListener("click", () => {
    if (!selectedBlock) return;

    // Check first there is at least another chromosome
    const remainingBlocks = data.filter(d => d.row_nb !== selectedBlock.row_nb);
    if (remainingBlocks.length === 0) {
        alert("The graph must contain at least one sequence.");
        return;
    }

    // Remove chromosome
    data = data.filter(d => d.row_nb != selectedBlock.row_nb)

    // Renumber the chromosomes
    data.forEach(d => {
        if (d.row_nb > selectedBlock.row_nb) {
            d.row_nb--;
        }
    });

    selectedBlock = null;
    draw();
    rightMenu.hidden = true;
    save(data);
});

document.querySelector("#add-before-chr").addEventListener("click", () => {
    if (!selectedBlock) return;

    const sourceChromosome = selectedBlock.row_nb;

    // Décale le chromosome sélectionné et ceux qui le suivent.
    data.forEach(d => {
        if (d.row_nb >= sourceChromosome) {
            d.row_nb++;
        }
    });

    // La copie prend le numéro libéré : elle apparaît avant l'original.
    const copies = data
        .filter(d => d.row_nb === sourceChromosome + 1)
        .map(d => ({
            ...d,
            id: nextBlockId++,
            row_nb: sourceChromosome
        }));

    data.push(...copies);

    selectedBlock = null;
    draw();
    rightMenu.hidden = true;
    save(data);
});

document.querySelector("#add-after-chr").addEventListener("click", () => {
    if (!selectedBlock) return;

    const sourceChromosome = selectedBlock.row_nb;

    const copies = data
        .filter(d => d.row_nb === sourceChromosome)
        .map(d => ({
            ...d,
            id: nextBlockId++,
            row_nb: sourceChromosome + 1
        }));

    // Libère le numéro suivant en décalant les chromosomes existants.
    data.forEach(d => {
        if (d.row_nb > sourceChromosome) {
            d.row_nb++;
        }
    });

    data.push(...copies);

    selectedBlock = null;
    draw();
    rightMenu.hidden = true;
    save(data);
});

document.querySelector(".reset-button").addEventListener("click", () => {
    load(0);
    draw();
    save(data_state[0])
})

function undo() {
    state_position--;
    load(state_position);
    console.log(data)
    draw();

    if (state_position == 0) {
        document.querySelector(".undo-button").disabled = true;
    }
    if (state_position < data_state.length - 1) {
        document.querySelector(".redo-button").disabled = false;
    }
}

function redo() {
    state_position++
    load(state_position);
    draw();

    if (state_position == data_state.length - 1) {
        document.querySelector(".redo-button").disabled = true;
    }
    if (state_position > 0) {
        document.querySelector(".undo-button").disabled = false;
    }
}

document.querySelector(".undo-button").addEventListener("click", () => undo())

document.querySelector(".redo-button").addEventListener("click", () => redo())


document.addEventListener("keydown", (event) => {
    // Ctrl+Z on Windows/Linux, Cmd+Z on Mac
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        // Let text fields handle their own undo
        if (event.target.matches("input, textarea, [contenteditable='true']")) return;

        event.preventDefault();

        if (state_position != 0) {
            undo();
        }
    }
});


document.addEventListener("keydown", (event) => {
    // Ctrl+Z on Windows/Linux, Cmd+Z on Mac
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        // Let text fields handle their own undo
        if (event.target.matches("input, textarea, [contenteditable='true']")) return;

        event.preventDefault();

        if (state_position != data_state.length - 1) {
            redo();
        }
    }
});

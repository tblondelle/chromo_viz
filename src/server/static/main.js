const width = 500;
const margin = { top: 10, right: 10, bottom: 10, left: 10 };
const labelWidth = 30;

let groups = [];
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

function drawCanvas() {
    // No animation : used for the 3 settings

    if (data.length === 0) return;

    const gap = +gapInput.value;
    const barHeight = +heightInput.value;
    const rowGapBp = +rowGapInput.value * barHeight;

    document.querySelector("#gap-value").textContent = gap;
    document.querySelector("#height-value").textContent = barHeight;
    document.querySelector("#row-gap-value").textContent = (rowGapBp / barHeight).toFixed(1);


    // Détermine l'ordre des chromosomes et leur position verticale.
    const chromosomes = [...new Set(data.map(d => d.chromosome))]
        .sort(d3.ascending);

    const rowByChromosome = new Map(
        chromosomes.map((chromosome, row) => [chromosome, row])
    );

    // Calcule x et y directement dans data.
    const offsetByChromosome = new Map();

    const chromosomeTotals = chromosomes.map(chromosome => ({
        chromosome,
        total: d3.sum(
            data.filter(d => d.chromosome === chromosome),
            d => d.size
        ),
        row: rowByChromosome.get(chromosome)
    }));

    data.forEach(d => {
        const row = rowByChromosome.get(d.chromosome);
        const offset = offsetByChromosome.get(d.chromosome) ?? 0;

        d.x = offset;
        d.y = margin.top + row * (barHeight + rowGapBp);
        d.row = row;

        offsetByChromosome.set(
            d.chromosome,
            offset + d.size + gap
        );
    });

    const maxTotal = d3.max(
        [...offsetByChromosome.values()],
        total => total - gap
    ) ?? 0;

    x = d3.scaleLinear()
        .domain([0, maxTotal || 1])
        .range([0, width - margin.left - margin.right - labelWidth]);

    const height = margin.top + margin.bottom
        + chromosomes.length * (barHeight + rowGapBp) - rowGapBp;

    const svg = d3.select("#chart")
        .selectAll("svg")
        .data([null])
        .join("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%")
        .style("height", "auto");


    svg.selectAll("text.chromosome-label")
        .data(chromosomeTotals, d => d.chromosome)
        .join("text")
        .attr("class", "chromosome-label")
        .attr("x", width - labelWidth)
        .attr("y", d =>
            margin.top + d.row * (barHeight + rowGapBp) + barHeight / 2
        )
        .attr("dy", "0.35em")
        .text(d => `${d.total}bp`);

    svg.selectAll("rect.block")
        .data(data, d => d.id)
        .join(
            enter => enter.append("rect")
                .attr("class", "block")
                .attr("x", d => margin.left + x(d.x))
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
                    .attr("width", d => x(d.size))
                    .attr("x", d => margin.left + x(d.x))
                ),

            update => update
                .transition()
                .duration(20)
                .attr("x", d => margin.left + x(d.x))
                .attr("y", d => d.y)
                .attr("height", barHeight)
                .attr("width", d => x(d.size))
                .attr("fill", d => d.color),

            exit => exit
                .attr("width", 0)
                .attr("x", function (d) {
                    const sameRow = data
                        .filter(block => block.row === d.row)
                        .sort((a, b) => a.x - b.x);

                    const previous = sameRow.filter(block => block.x < d.x).at(-1);
                    const next = sameRow.find(block => block.x >= d.x);

                    const previousX = previous ? margin.left + x(previous.x + previous.size) : margin.left;
                    const nextX = next ? margin.left + x(next.x) : width - margin.left - margin.right - labelWidth;

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


function draw() {
    // Full blown draw function

    if (data.length === 0) return;

    const gap = +gapInput.value;
    const barHeight = +heightInput.value;
    const rowGapBp = +rowGapInput.value * barHeight;

    document.querySelector("#gap-value").textContent = gap;
    document.querySelector("#height-value").textContent = barHeight;
    document.querySelector("#row-gap-value").textContent = (rowGapBp / barHeight).toFixed(1);


    // Détermine l'ordre des chromosomes et leur position verticale.
    const chromosomes = [...new Set(data.map(d => d.chromosome))]
        .sort(d3.ascending);

    const rowByChromosome = new Map(
        chromosomes.map((chromosome, row) => [chromosome, row])
    );

    // Calcule x et y directement dans data.
    const offsetByChromosome = new Map();

    const chromosomeTotals = chromosomes.map(chromosome => ({
        chromosome,
        total: d3.sum(
            data.filter(d => d.chromosome === chromosome),
            d => d.size
        ),
        row: rowByChromosome.get(chromosome)
    }));

    data.forEach(d => {
        const row = rowByChromosome.get(d.chromosome);
        const offset = offsetByChromosome.get(d.chromosome) ?? 0;

        d.x = offset;
        d.y = margin.top + row * (barHeight + rowGapBp);
        d.row = row;

        offsetByChromosome.set(
            d.chromosome,
            offset + d.size + gap
        );
    });

    const maxTotal = d3.max(
        [...offsetByChromosome.values()],
        total => total - gap
    ) ?? 0;

    x = d3.scaleLinear()
        .domain([0, maxTotal || 1])
        .range([0, width - margin.left - margin.right - labelWidth]);

    const height = margin.top + margin.bottom
        + chromosomes.length * (barHeight + rowGapBp) - rowGapBp;

    const svg = d3.select("#chart")
        .selectAll("svg")
        .data([null])
        .join("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%")
        .style("height", "auto");


    svg.selectAll("text.chromosome-label")
        .data(chromosomeTotals, d => d.chromosome)
        .join("text")
        .attr("class", "chromosome-label")
        .attr("x", width - labelWidth)
        .attr("y", d =>
            margin.top + d.row * (barHeight + rowGapBp) + barHeight / 2
        )
        .attr("dy", "0.35em")
        .text(d => `${d.total}bp`);

    svg.selectAll("rect.block")
        .data(data, d => d.id)
        .join(
            enter => enter.append("rect")
                .attr("class", "block")
                .attr("x", d => margin.left + x(d.x))
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
                    .attr("x", d => margin.left + x(d.x + d.size / 2))
                    .attr("height", 0)
                    .attr("y", d => d.y + barHeight / 2)
                    .transition()
                    .duration(200)
                    .attr("width", d => x(d.size))
                    .attr("x", d => margin.left + x(d.x))
                    .attr("height", barHeight)
                    .attr("y", d => d.y)
                ),

            update => update
                .transition()
                .duration(200)
                .attr("x", d => margin.left + x(d.x))
                .attr("y", d => d.y)
                .attr("height", barHeight)
                .attr("width", d => x(d.size))
                .attr("fill", d => d.color),

            exit => exit
                .transition()
                .duration(200)
                .attr("width", 0)
                .attr("x", function (d) {
                    const sameRow = data
                        .filter(block => block.row === d.row)
                        .sort((a, b) => a.x - b.x);

                    const previous = sameRow.filter(block => block.x < d.x).at(-1);
                    const next = sameRow.find(block => block.x >= d.x);

                    const previousX = previous ? margin.left + x(previous.x + previous.size) : margin.left;
                    const nextX = next ? margin.left + x(next.x) : margin.left + x(d.x + d.size);

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


function drawValue() {

    if (data.length === 0) return;

    const gap = +gapInput.value;
    const barHeight = +heightInput.value;
    const rowGapBp = +rowGapInput.value * barHeight;

    document.querySelector("#gap-value").textContent = gap;
    document.querySelector("#height-value").textContent = barHeight;
    document.querySelector("#row-gap-value").textContent = (rowGapBp / barHeight).toFixed(1);


    // Détermine l'ordre des chromosomes et leur position verticale.
    const chromosomes = [...new Set(data.map(d => d.chromosome))]
        .sort(d3.ascending);

    const rowByChromosome = new Map(
        chromosomes.map((chromosome, row) => [chromosome, row])
    );

    // Calcule x et y directement dans data.
    const offsetByChromosome = new Map();

    const chromosomeTotals = chromosomes.map(chromosome => ({
        chromosome,
        total: d3.sum(
            data.filter(d => d.chromosome === chromosome),
            d => d.size
        ),
        row: rowByChromosome.get(chromosome)
    }));

    data.forEach(d => {
        const row = rowByChromosome.get(d.chromosome);
        const offset = offsetByChromosome.get(d.chromosome) ?? 0;

        d.x = offset;
        d.y = margin.top + row * (barHeight + rowGapBp);
        d.row = row;

        offsetByChromosome.set(
            d.chromosome,
            offset + d.size + gap
        );
    });

    const maxTotal = d3.max(
        [...offsetByChromosome.values()],
        total => total - gap
    ) ?? 0;

    const x = d3.scaleLinear()
        .domain([0, maxTotal || 1])
        .range([0, width - margin.left - margin.right - labelWidth]);

    const height = margin.top + margin.bottom
        + chromosomes.length * (barHeight + rowGapBp) - rowGapBp;

    const svg = d3.select("#chart")
        .selectAll("svg")
        .data([null])
        .join("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%")
        .style("height", "auto");

    svg.selectAll("text.chromosome-label")
        .data(chromosomeTotals, d => d.chromosome)
        .join("text")
        .attr("class", "chromosome-label")
        .attr("x", width - 3 * margin.right)
        .attr("y", d =>
            margin.top + d.row * (barHeight + rowGapBp) + barHeight / 2
        )
        .attr("dy", "0.35em")
        .text(d => `${d.total}bp`);

    svg.selectAll("rect.block")
        .data(data, d => d.id)
        .join(
            enter => enter.append("rect")
                .attr("class", "block")
                .attr("x", d => margin.left + x(d.x))
                .attr("y", d => d.y)
                .attr("width", d => x(d.size))
                .attr("height", barHeight)
                .attr("fill", d => d.color)
                .style("cursor", "pointer")
                .on("click", (event, d) => {
                    selectedBlock = d;
                    rightMenu.hidden = false;
                    rightMenu.style.position = "fixed";
                    rightMenu.style.left = `${event.clientX + 10}px`;
                    rightMenu.style.top = `${event.clientY + 10}px`;
                })
                .call(enter => enter
                    .attr("width", 0)
                    .attr("x", 0)
                    .transition()
                    .duration(400)
                    .attr("width", d => x(d.size))
                    .attr("x", d => margin.left + x(d.x))
                ),

            update => update
                .transition()
                .duration(400)
                .attr("x", d => margin.left + x(d.x))
                .attr("y", d => d.y)
                .attr("height", barHeight)
                .attr("width", d => x(d.size))
                .attr("fill", d => d.color),

            exit => exit
                .transition()
                .duration(400)
                .attr("width", 0)
                .remove()
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

    nextBlockId = 0;
    data = d3.dsvFormat(";").parse(text, d => ({
        chromosome: Number(d.chromosome_number),
        size: Number(d.size),
        color: d.color.startsWith("#") ? d.color : `#${d.color}`,
        id: nextBlockId++,
    }));


    d3.select("#chart")
        .selectAll("svg")
        .selectAll("*").remove()

    draw();
}


// Initial load
fetch("data.csv")
    .then(response => {
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        return response.text();
    })
    .then(loadCsvText)
    .catch(error => {
        console.error("Impossible to load CSV file:", error);
        alert("The default CSV file could not be loaded.");
    });


// Listeners
document.querySelector("#export-csv").addEventListener("click", () => {
    if (data.length === 0) {
        alert("No data to export. First load a CSV file.");
        return;
    }

    const rows = [["chromosome_number", "size", "color"]];

    data.sort((a, b) => a.row - b.row || a.x - b.x);

    // Use row instead of chromosome for the export. Sort before.
    data.forEach(d => {
        rows.push([d.row, d.size, d.color]);
    });

    const csv = rows
        .map(row => row.map(value => String(value ?? ""))
            .join(";"))
        .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "groups.csv";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.querySelector("#export-svg").addEventListener("click", () => {
    const svg = document.querySelector("#chart svg");

    if (!svg) {
        alert("Aucun graphe à exporter.");
        return;
    }

    const contenu = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([contenu], {
        type: "image/svg+xml;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = "graphe.svg";
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
        console.error("Impossible de lire le CSV :", error);
        alert("Le fichier CSV n’a pas pu être lu. \n" + error);
    }
});

gapInput.addEventListener("input", drawCanvas);

heightInput.addEventListener("input", drawCanvas);

rowGapInput.addEventListener("input", drawCanvas);

// Menus
document.addEventListener("click", event => {
    if (
        !event.target.closest("#right-menu") &&
        !event.target.closest("#chart svg rect")
    ) {
        rightMenu.hidden = true;
    }
});

document.querySelector("#edit-color").addEventListener("click", () => {
    if (!selectedBlock) return;

    colorPicker.value = /^#[0-9a-f]{6}$/i.test(selectedBlock.color)
        ? selectedBlock.color
        : "#000000";

    rightMenu.hidden = true;
    colorPicker.click();
});

document.querySelector("#edit-size").addEventListener("click", () => {
    if (!selectedBlock) return;

    const value = prompt("Nouvelle valeur :", selectedBlock.size);
    if (value === null) return;

    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        alert("Saisis une valeur numérique supérieure à 0.");
        return;
    }

    selectedBlock.size = size;
    draw();
    rightMenu.hidden = true;
});

document.querySelector("#remove-seq").addEventListener("click", () => {
    if (!selectedBlock) return;

    if (data.length === 1) {
        alert("The graph must contain at least one sequence.");
        return;
    }


    const index = data.findIndex(d => d.id === selectedBlock.id);
    if (index === -1) return;

    data.splice(index, 1);
    selectedBlock = null;

    draw();
    rightMenu.hidden = true;
});

document.querySelector("#add-before").addEventListener("click", () => {
    if (!selectedBlock) return;

    const value = prompt("Nouvelle valeur :", selectedBlock.size);
    if (value === null) return;

    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        alert("Saisis une valeur numérique supérieure à 0.");
        return;
    }

    const index = data.findIndex(d => d.id === selectedBlock.id);
    if (index === -1) return;

    const newBlock = {
        id: nextBlockId++,
        chromosome: selectedBlock.chromosome,
        size,
        color: selectedBlock.color
    };

    data.splice(index, 0, newBlock);

    draw();
    rightMenu.hidden = true;
});

document.querySelector("#add-after").addEventListener("click", () => {
    if (!selectedBlock) return;

    const value = prompt("Nouvelle valeur :", selectedBlock.size);
    if (value === null) return;

    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        alert("Saisis une valeur numérique supérieure à 0.");
        return;
    }

    const index = data.findIndex(d => d.id === selectedBlock.id);
    if (index === -1) return;

    const newBlock = {
        id: nextBlockId++,
        chromosome: selectedBlock.chromosome,
        size,
        color: selectedBlock.color
    };

    data.splice(index + 1, 0, newBlock);

    draw();
    rightMenu.hidden = true;
});

document.querySelector("#remove-chr").addEventListener("click", () => {
    if (!selectedBlock) return;

    const chromosome = selectedBlock.chromosome;
    const remainingBlocks = data.filter(d => d.chromosome !== chromosome);

    if (remainingBlocks.length === 0) {
        alert("The graph must contain at least one sequence.");
        return;
    }

    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].chromosome === chromosome) {
            data.splice(i, 1);
        }
    }

    selectedBlock = null;
    draw();
    rightMenu.hidden = true;
});

document.querySelector("#add-before-chr").addEventListener("click", () => {
    if (!selectedBlock) return;

    const sourceChromosome = selectedBlock.chromosome;

    // Décale le chromosome sélectionné et ceux qui le suivent.
    data.forEach(d => {
        if (d.chromosome >= sourceChromosome) {
            d.chromosome += 1;
        }
    });

    // La copie prend le numéro libéré : elle apparaît avant l'original.
    const copies = data
        .filter(d => d.chromosome === sourceChromosome + 1)
        .map(d => ({
            ...d,
            id: nextBlockId++,
            chromosome: sourceChromosome
        }));

    data.push(...copies);

    selectedBlock = null;
    draw();
    rightMenu.hidden = true;
});

document.querySelector("#add-after-chr").addEventListener("click", () => {
    if (!selectedBlock) return;

    const sourceChromosome = selectedBlock.chromosome;

    const copies = data
        .filter(d => d.chromosome === sourceChromosome)
        .map(d => ({
            ...d,
            id: nextBlockId++,
            chromosome: sourceChromosome + 1
        }));

    // Libère le numéro suivant en décalant les chromosomes existants.
    data.forEach(d => {
        if (d.chromosome > sourceChromosome) {
            d.chromosome += 1;
        }
    });

    data.push(...copies);

    selectedBlock = null;
    draw();
    rightMenu.hidden = true;
});


colorPicker.addEventListener("input", () => {
    if (!selectedBlock) return;

    selectedBlock.color = colorPicker.value;
    drawCanvas();
});
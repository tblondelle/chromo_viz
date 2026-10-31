document.getElementById("export-ppt").addEventListener("click", async () => {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();

    const slideWidth = 10;
    const slideHeight = 5.625;

    const chromosomes = [...new Set(data.map(d => d.chromosome))]
        .sort(d3.ascending);

    const barHeight = Number(heightInput.value);
    const rowGapBp = Number(rowGapInput.value) * barHeight;

    const svgHeight =
        margin.top +
        margin.bottom +
        chromosomes.length * (barHeight + rowGapBp) -
        rowGapBp;

    const svgWidth = margin.left + width + margin.right;

    // Ajuste le graphique à la diapositive sans déformer les formes.
    const scale = Math.min(slideWidth / svgWidth, slideHeight / svgHeight);

    document.querySelectorAll(".block").forEach(element => {
        const x = Number(element.getAttribute("x"));
        const y = Number(element.getAttribute("y"));
        const w = Number(element.getAttribute("width"));
        const h = Number(element.getAttribute("height"));
        const fill = element.getAttribute("fill").slice(1);

        slide.addShape(pptx.ShapeType.rect, {
            x: x * scale,
            y: y * scale,
            w: w * scale,
            h: h * scale,
            fill: { color: fill }
        });
    });

    document.querySelectorAll(".chromosome-label").forEach(element => {
        let textboxText = element.textContent;
        const x = Number(element.getAttribute("x"));
        const y = Number(element.getAttribute("y"));
        let textboxOpts = {
            x: x * scale,
            y: y * scale - 0.5 / 2,
            w: "1",
            h: "0.5",
            color: "363636",
            isTextBox: true,
        };
        slide.addText(textboxText, textboxOpts);
    });

    await pptx.writeFile({ fileName: "ChromoViz.pptx" });
});
document.getElementById("export-ppt").addEventListener("click", async () => {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();

    const slideWidth = 10;
    const slideHeight = 5.625;
    const slideMargin = 0.5;

    const chromosomes = [...new Set(data.map(d => d.chromosome))]
        .sort(d3.ascending);

    const barHeight = Number(heightInput.value);
    const rowGapBp = Number(rowGapInput.value) * barHeight;

    const svgHeight =
        chromosomes.length * (barHeight + rowGapBp) -
        rowGapBp;

    // Ajuste le graphique à la diapositive sans déformer les formes.
    const scale = Math.min((slideWidth - 2 * slideMargin) / width,
        (slideHeight - 2 * slideMargin) / svgHeight);

    function getHexColor(rect) {
        const fill = rect.getAttribute("fill");
        const ctx = document.createElement("canvas").getContext("2d");

        ctx.fillStyle = fill;
        const normalized = ctx.fillStyle;

        if (normalized.startsWith("#")) return normalized.toUpperCase().slice(1);

        const [r, g, b] = normalized.match(/\d+/g).map(Number);
        return [r, g, b]
            .map(n => n.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
    }

    document.querySelectorAll(".block").forEach(element => {
        const x = Number(element.getAttribute("x"));
        const y = Number(element.getAttribute("y"));
        const w = Number(element.getAttribute("width"));
        const h = Number(element.getAttribute("height"));
        const fill = getHexColor(element);

        slide.addShape(pptx.ShapeType.rect, {
            x: slideMargin + x * scale,
            y: slideMargin + y * scale,
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
            x: slideMargin + x * scale,
            y: slideMargin + y * scale - 0.5 / 2,
            w: "1",
            h: "0.5",
            color: "363636",
            isTextBox: true,
        };
        slide.addText(textboxText, textboxOpts);
    });

    await pptx.writeFile({ fileName: "ChromoViz.pptx" });
});
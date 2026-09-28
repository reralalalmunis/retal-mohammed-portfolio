(() => {
  "use strict";

  const button = document.getElementById("download-cv");
  const { jsPDF } = window.jspdf || {};

  function base64ToBinary(base64) {
    const raw = atob(base64);
    let binary = "";
    for (let index = 0; index < raw.length; index += 8192) binary += raw.slice(index, index + 8192);
    return binary;
  }

  function splitLines(doc, content, width) {
    return doc.splitTextToSize(content, width);
  }

  function createPdf() {
    const app = window.CVIdentity;
    if (!app || !jsPDF || !window.CV_IDENTITY_ARABIC_FONT_BASE64) throw new Error("PDF exporter is unavailable.");
    const state = app.getState();
    const locale = app.getLocale();
    const isArabic = locale === "ar";
    const get = app.getText;
    const ui = app.getUiText;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", putOnlyUsedFonts: true, compress: true });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 17;
    const contentWidth = pageWidth - margin * 2;
    const alignment = isArabic ? "right" : "left";
    const textX = isArabic ? pageWidth - margin : margin;
    let y = 18;
    let page = 1;

    doc.addFileToVFS("NotoSansArabic-Regular.ttf", base64ToBinary(window.CV_IDENTITY_ARABIC_FONT_BASE64));
    doc.addFont("NotoSansArabic-Regular.ttf", "NotoArabic", "normal");
    doc.setFont("NotoArabic", "normal");
    doc.setProperties({ title: `${get(state.profile.name)} CV`, subject: get(state.profile.title), author: get(state.profile.name), creator: "CV Identity" });

    function addPage() {
      doc.addPage();
      page += 1;
      y = 18;
    }

    function ensureHeight(height) {
      if (y + height > pageHeight - 18) addPage();
    }

    function writeLine(value, size, color, options = {}) {
      const lineHeight = options.lineHeight || size * 0.5;
      const lines = splitLines(doc, value, contentWidth);
      ensureHeight(lines.length * lineHeight + (options.marginBottom || 0));
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(lines, textX, y, { align: alignment, isInputRtl: isArabic, maxWidth: contentWidth, lineHeightFactor: options.lineHeightFactor || 1.25 });
      y += lines.length * lineHeight + (options.marginBottom || 0);
    }

    function section(title) {
      ensureHeight(12);
      y += 2;
      doc.setDrawColor(23, 100, 192);
      if (isArabic) doc.line(pageWidth - margin, y, pageWidth - margin - contentWidth, y);
      else doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      writeLine(title, 12, [7, 21, 47], { marginBottom: 2 });
    }

    function drawHeader() {
      doc.setFillColor(7, 21, 47);
      doc.rect(0, 0, pageWidth, 44, "F");
      y = 16;
      writeLine(get(state.profile.name), 23, [255, 255, 255], { lineHeight: 10 });
      writeLine(get(state.profile.title), 11, [220, 238, 255], { lineHeight: 5.8 });
      writeLine(get(state.profile.location), 9.5, [135, 194, 255], { lineHeight: 5, marginBottom: 5 });
      y = 53;
    }

    function footer() {
      const total = doc.getNumberOfPages();
      for (let index = 1; index <= total; index += 1) {
        doc.setPage(index);
        doc.setFont("NotoArabic", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(33, 79, 140);
        const pageLabel = `${page > 1 ? "" : ""}${index} / ${total}`;
        doc.text(pageLabel, isArabic ? margin : pageWidth - margin, pageHeight - 10, { align: isArabic ? "left" : "right" });
        doc.text("CV Identity", isArabic ? pageWidth - margin : margin, pageHeight - 10, { align: isArabic ? "right" : "left" });
      }
    }

    drawHeader();
    section(ui("aboutTitle"));
    writeLine(get(state.profile.summary), 10, [7, 21, 47], { lineHeight: 5.4, marginBottom: 3 });

    section(ui("experienceTitle"));
    state.experience.forEach((item) => {
      writeLine(get(item.title), 10.5, [7, 21, 47], { lineHeight: 5.2 });
      writeLine(`${get(item.organization)} · ${app.formatPeriod(item.period)}`, 8.6, [33, 79, 140], { lineHeight: 4.5 });
      writeLine(get(item.description), 8.7, [7, 21, 47], { lineHeight: 4.6, marginBottom: 3.2 });
    });

    section(ui("educationTitle"));
    writeLine(get(state.education.degree), 10.5, [7, 21, 47], { lineHeight: 5.2 });
    writeLine(`${get(state.education.institution)} · ${app.formatPeriod(state.education.period)}`, 8.7, [33, 79, 140], { lineHeight: 4.6, marginBottom: 3 });

    section(ui("skillsTitle"));
    writeLine(state.skills.map(get).join(" • "), 9, [7, 21, 47], { lineHeight: 4.8, marginBottom: 3 });

    section(ui("credentialsTitle"));
    writeLine(state.credentials.map(get).join(" • "), 8.7, [7, 21, 47], { lineHeight: 4.6, marginBottom: 3 });

    section(ui("languagesTitle"));
    writeLine(state.languages.map((language) => `${get(language.name)} (${get(language.level)})`).join(" • "), 9, [7, 21, 47], { lineHeight: 4.8, marginBottom: 3 });

    const liveProjects = state.projects.filter((project) => project.status === "live");
    if (liveProjects.length) {
      section(ui("portfolioTitle"));
      liveProjects.forEach((project) => {
        writeLine(`${get(project.title)} — ${get(project.type)}`, 9.5, [7, 21, 47], { lineHeight: 4.9 });
        writeLine(get(project.description), 8.5, [33, 79, 140], { lineHeight: 4.5 });
        ensureHeight(6);
        doc.setTextColor(23, 100, 192);
        doc.setFontSize(7.8);
        doc.textWithLink(project.url, textX, y, { url: project.url, align: alignment, isInputRtl: false });
        y += 6;
      });
    }

    footer();
    const safeName = get(state.profile.name).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "professional-cv";
    doc.save(`${safeName}-${locale}-cv.pdf`);
  }

  button.addEventListener("click", () => {
    const app = window.CVIdentity;
    if (!app) return;
    const previous = button.textContent;
    button.disabled = true;
    button.textContent = app.getUiText("generating");
    app.announce(app.getUiText("generating"));
    window.setTimeout(() => {
      try {
        createPdf();
        app.announce(app.getUiText("pdfReady"));
      } catch (error) {
        console.error(error);
        app.announce(app.getUiText("pdfError"));
        window.print();
        app.announce(app.getUiText("pdfFallback"));
      } finally {
        button.disabled = false;
        button.textContent = previous;
      }
    }, 30);
  });
})();

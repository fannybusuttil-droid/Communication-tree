// ═══════════════════════════════════════════════
// Belita NGO — Excel Export (Bridgital Design)
// ═══════════════════════════════════════════════

function exportExcel() {
  var wb = XLSX.utils.book_new();

  // ── Couleurs Bridgital ──
  var BASE_COLORS  = { Gaza: "1A6B65", Jerusalem: "1E4D8C", Amman: "5C3A8C" };
  var LEVEL_COLORS = { L1: "C9A84C",  L2: "1A6B65",  L3: "1E4D8C", L4: "888888" };
  var DEPT_COLORS  = {
    "Health":             "C0392B",
    "Food Distribution":  "D4891A",
    "Logistics":          "2471A3",
    "Infrastructure":     "7D6608",
    "Water & Sanitation": "117A65",
    "Coordination":       "6C3483"
  };

  // ── Styles helpers ──
  function headerStyle(rgb) {
    return {
      font:      { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Calibri" },
      fill:      { patternType: "solid", fgColor: { rgb: rgb } },
      alignment: { horizontal: "center", vertical: "center", wrapText: false },
      border: {
        top:    { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "medium", color: { rgb: "FFFFFF" } },
        left:   { style: "thin", color: { rgb: "FFFFFF" } },
        right:  { style: "thin", color: { rgb: "FFFFFF" } }
      }
    };
  }

  function cellStyle(bgRgb, fgRgb, bold, center) {
    return {
      font:      { bold: !!bold, color: { rgb: fgRgb || "1C2B2A" }, sz: 10, name: "Calibri" },
      fill:      { patternType: "solid", fgColor: { rgb: bgRgb || "FFFFFF" } },
      alignment: { horizontal: center ? "center" : "left", vertical: "center" },
      border: {
        bottom: { style: "thin", color: { rgb: "E2E6E5" } },
        right:  { style: "thin", color: { rgb: "E2E6E5" } }
      }
    };
  }

  function pillStyle(rgb) {
    return {
      font:      { bold: true, color: { rgb: "FFFFFF" }, sz: 9, name: "Calibri" },
      fill:      { patternType: "solid", fgColor: { rgb: rgb } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        right:  { style: "thin", color: { rgb: "FFFFFF" } }
      }
    };
  }

  function applyStyle(ws, cellAddr, style) {
    if (!ws[cellAddr]) return;
    ws[cellAddr].s = style;
  }

  // ── Feuille par base ──
  var bases = ["Gaza", "Jerusalem", "Amman"];

  bases.forEach(function (base) {
    var staff = STAFF.filter(function (s) { return s.base === base; });
    if (!staff.length) return;

    // Sort: L1 → L2 → L3 → L4, puis alphabétique
    staff.sort(function (a, b) {
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return a.name.localeCompare(b.name);
    });

    var headers = ["ID", "Nom complet", "Poste", "Département", "Niveau", "Téléphone", "Email", "Rapporte à"];
    var aoa = [headers];
    staff.forEach(function (s) {
      aoa.push([s.id, s.name, s.title, s.dept, s.level, s.phone, s.email, s.reportsTo || "—"]);
    });

    var ws = XLSX.utils.aoa_to_sheet(aoa);

    // Largeurs colonnes
    ws["!cols"] = [
      { wch: 10 },  // ID
      { wch: 26 },  // Nom
      { wch: 30 },  // Poste
      { wch: 22 },  // Dept
      { wch: 8  },  // Niveau
      { wch: 20 },  // Téléphone
      { wch: 32 },  // Email
      { wch: 26 }   // Rapporte à
    ];

    // Hauteur lignes
    ws["!rows"] = [{ hpt: 24 }]; // header
    for (var i = 0; i < staff.length; i++) {
      ws["!rows"].push({ hpt: 20 });
    }

    var baseColor = BASE_COLORS[base] || "1A6B65";

    // Style en-têtes
    headers.forEach(function (h, ci) {
      var addr = XLSX.utils.encode_cell({ r: 0, c: ci });
      applyStyle(ws, addr, headerStyle(baseColor));
    });

    // Style données
    staff.forEach(function (s, ri) {
      var row = ri + 1;
      var isEven = ri % 2 === 0;
      var rowBg = isEven ? "F8FAFA" : "FFFFFF";
      var isKeyStaff = s.level === "L1" || s.level === "L2";

      // ID
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 0 }),
        cellStyle("E8F4F3", "1A6B65", true, true));

      // Nom — gras si L1/L2
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 1 }),
        cellStyle(isKeyStaff ? "FFFDF0" : rowBg, "1C2B2A", isKeyStaff));

      // Poste
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 2 }),
        cellStyle(rowBg, "4A6361", false));

      // Département — couleur du dept
      var dc = DEPT_COLORS[s.dept] || "888888";
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 3 }),
        cellStyle(rowBg, dc, true));

      // Niveau — pill coloré
      var lc = LEVEL_COLORS[s.level] || "888888";
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 4 }),
        pillStyle(lc));

      // Téléphone
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 5 }),
        cellStyle(rowBg, "1A6B65", false));

      // Email
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 6 }),
        cellStyle(rowBg, "4A6361", false));

      // Rapporte à
      applyStyle(ws, XLSX.utils.encode_cell({ r: row, c: 7 }),
        cellStyle(rowBg, "888888", false));
    });

    XLSX.utils.book_append_sheet(wb, ws, base);
  });

  // ── Feuille Résumé ──
  var sumHeaders = ["Base", "Total Staff", "L1 — Directeurs", "L2 — Managers", "L3 — Officers", "L4 — Field Staff"];
  var sumData = [sumHeaders];

  bases.forEach(function (base) {
    var bs = STAFF.filter(function (s) { return s.base === base; });
    sumData.push([
      base,
      bs.length,
      bs.filter(function (s) { return s.level === "L1"; }).length,
      bs.filter(function (s) { return s.level === "L2"; }).length,
      bs.filter(function (s) { return s.level === "L3"; }).length,
      bs.filter(function (s) { return s.level === "L4"; }).length
    ]);
  });

  // Total row
  sumData.push([
    "TOTAL",
    STAFF.length,
    STAFF.filter(function (s) { return s.level === "L1"; }).length,
    STAFF.filter(function (s) { return s.level === "L2"; }).length,
    STAFF.filter(function (s) { return s.level === "L3"; }).length,
    STAFF.filter(function (s) { return s.level === "L4"; }).length
  ]);

  var wsSummary = XLSX.utils.aoa_to_sheet(sumData);
  wsSummary["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 18 }];
  wsSummary["!rows"] = [{ hpt: 24 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 22 }];

  // Header résumé
  sumHeaders.forEach(function (h, ci) {
    var addr = XLSX.utils.encode_cell({ r: 0, c: ci });
    applyStyle(wsSummary, addr, headerStyle("124E49"));
  });

  // Lignes bases
  bases.forEach(function (base, ri) {
    var row = ri + 1;
    var bc = BASE_COLORS[base] || "1A6B65";
    applyStyle(wsSummary, XLSX.utils.encode_cell({ r: row, c: 0 }), cellStyle(bc + "22", bc, true));
    applyStyle(wsSummary, XLSX.utils.encode_cell({ r: row, c: 1 }), cellStyle("FFFFFF", "1C2B2A", true, true));
    applyStyle(wsSummary, XLSX.utils.encode_cell({ r: row, c: 2 }), pillStyle(LEVEL_COLORS["L1"]));
    applyStyle(wsSummary, XLSX.utils.encode_cell({ r: row, c: 3 }), pillStyle(LEVEL_COLORS["L2"]));
    applyStyle(wsSummary, XLSX.utils.encode_cell({ r: row, c: 4 }), pillStyle(LEVEL_COLORS["L3"]));
    applyStyle(wsSummary, XLSX.utils.encode_cell({ r: row, c: 5 }), pillStyle(LEVEL_COLORS["L4"]));
  });

  // Total row style
  var totalRow = bases.length + 1;
  for (var ci = 0; ci < 6; ci++) {
    applyStyle(wsSummary, XLSX.utils.encode_cell({ r: totalRow, c: ci }),
      cellStyle("124E49", "FFFFFF", true, ci > 0));
  }

  XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé");

  // ── Export ──
  var date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, "Belita_Directory_" + date + ".xlsx");
}

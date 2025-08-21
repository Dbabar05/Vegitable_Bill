document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#billTable tbody");
  const MIN_ROWS = 5;

  // Build one empty row
  const buildRowHTML = () => `
    <tr>
      <td><input type="number" class="form-control noBox" min="0" step="1" /></td>
      <td><input type="number" class="form-control oneBoxWeight" min="0" step="0.01" /></td>
      <td><input type="number" class="form-control totalWeight" readonly /></td>
      <td><input type="number" class="form-control rate" min="0" step="0.01" /></td>
      <td><input type="number" class="form-control amount" readonly /></td>
      <td class="text-center"><button type="button" class="btn btn-danger btn-sm removeRow">X</button></td>
    </tr>
  `;

  // Ensure at least MIN_ROWS rows exist
  function ensureMinRows() {
    const current = tbody.querySelectorAll("tr").length;
    for (let i = current; i < MIN_ROWS; i++) {
      tbody.insertAdjacentHTML("beforeend", buildRowHTML());
    }
  }

  // Add Row
  document.getElementById("addRow").addEventListener("click", () => {
    tbody.insertAdjacentHTML("beforeend", buildRowHTML());
    updateTotals();
  });

  // Remove Row (min 10 kept)
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("removeRow")) {
      const rows = tbody.querySelectorAll("tr").length;
      if (rows > MIN_ROWS) {
        e.target.closest("tr").remove();
        updateTotals();
      }
    }
  });

  // Live calculations
  document.addEventListener("input", (e) => {
    if (
      e.target.classList.contains("noBox") ||
      e.target.classList.contains("oneBoxWeight") ||
      e.target.classList.contains("rate") ||
      ["comm","transport","privbal","advance"].includes(e.target.id)
    ) {
      updateTotals();
    }
  });

  // Print
  document.getElementById("printBtn").addEventListener("click", () => window.print());

  // Save PDF
  document.getElementById("saveBtn").addEventListener("click", () => {
    updateTotals(); // refresh numbers
    const element = document.querySelector(".bill-container");

    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'bill.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save();
  });

  // Init
  ensureMinRows();
  updateTotals();
});

// Helpers
function toFixed2(n) { return (parseFloat(n) || 0).toFixed(2); }

function updateTotals() {
  let subTotal = 0, totalBoxes = 0;

  document.querySelectorAll("#billTable tbody tr").forEach((row) => {
    const noBox = parseFloat(row.querySelector(".noBox")?.value) || 0;
    const oneBoxWeight = parseFloat(row.querySelector(".oneBoxWeight")?.value) || 0;
    const rate = parseFloat(row.querySelector(".rate")?.value) || 0;

    const totalWeight = noBox * oneBoxWeight;
    const amount = totalWeight * rate;

    row.querySelector(".totalWeight").value = toFixed2(totalWeight);
    row.querySelector(".amount").value = toFixed2(amount);

    totalBoxes += noBox;
    subTotal += amount;
  });

  document.getElementById("subTotal").innerText = toFixed2(subTotal);
  document.getElementById("totalBoxes").innerText = totalBoxes;

  const comm      = parseFloat(document.getElementById("comm")?.value) || 0;
  const transport = parseFloat(document.getElementById("transport")?.value) || 0;
  const privbal   = parseFloat(document.getElementById("privbal")?.value) || 0;
  const advance   = parseFloat(document.getElementById("advance")?.value) || 0;

  const grandTotal = subTotal + comm + transport + privbal - advance;
  document.getElementById("grandTotal").innerText = toFixed2(grandTotal);
}

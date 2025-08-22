document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#billTable tbody");
  const MIN_ROWS = 5;

  const buildRowHTML = () => `
    <tr>
      <td><input type="number" class="small-input noBox" min="0" step="1" /></td>
      <td><input type="number" class="small-input oneBoxWeight" min="0" step="0.01" /></td>
      <td><input type="number" class="large-input totalWeight" readonly /></td>
      <td><input type="number" class="small-input rate" min="0" step="0.01" /></td>
      <td><input type="number" class="large-input amount" readonly /></td>
    </tr>
  `;

  function ensureMinRows() {
    const current = tbody.querySelectorAll("tr").length;
    for (let i = current; i < MIN_ROWS; i++) {
      tbody.insertAdjacentHTML("beforeend", buildRowHTML());
    }
  }

  document.getElementById("addRow").addEventListener("click", () => {
    tbody.insertAdjacentHTML("beforeend", buildRowHTML());
    updateTotals();
  });

  document.addEventListener("input", (e) => {
    if (
      e.target.classList.contains("noBox") ||
      e.target.classList.contains("oneBoxWeight") ||
      e.target.classList.contains("rate") ||
      ["commQty","commRate","ppQty","ppRate","transport","privbal","advance","amtReceived","writeHereNum"].includes(e.target.id)
    ) {
      updateTotals();
    }
  });

  document.getElementById("printBtn").addEventListener("click", () => window.print());

  document.getElementById("saveBtn").addEventListener("click", () => {
    updateTotals();
    const element = document.querySelector(".bill-container");

    let name = document.getElementById("custName")?.value.trim() || "NoName";
    let date = document.getElementById("billDate")?.value.trim() || new Date().toISOString().split("T")[0];

    name = name.replace(/\s+/g, "_");
    date = date.replace(/\//g, "-").replace(/\\/g, "-");

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${name}_${date}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2.5, useCORS: true, scrollY: 0, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save();
  });

  ensureMinRows();
  updateTotals();
});

function toFixed2(n) {
  return (parseFloat(n) || 0).toFixed(2);
}

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

  // update subtotal
  document.getElementById("subTotal").innerText = toFixed2(subTotal);
  document.getElementById("totalBoxes").innerText = totalBoxes;

  // commissions
  const commQty = parseFloat(document.getElementById("commQty").value) || 0;
  const commRate = parseFloat(document.getElementById("commRate").value) || 0;
  const commTotal = commQty * commRate;
  document.getElementById("commTotal").value = toFixed2(commTotal);

  // PP Charges
  const ppQty = parseFloat(document.getElementById("ppQty").value) || 0;
  const ppRate = parseFloat(document.getElementById("ppRate").value) || 0;
  const ppTotal = ppQty * ppRate;
  document.getElementById("ppTotal").value = toFixed2(ppTotal);

  const transport = parseFloat(document.getElementById("transport").value) || 0;
  const privbal   = parseFloat(document.getElementById("privbal").value) || 0;
  const advance   = parseFloat(document.getElementById("advance").value) || 0;
  const writeHereNum = parseFloat(document.getElementById("writeHereNum")?.value) || 0;

  const grandTotal = subTotal + commTotal + ppTotal + transport + privbal + writeHereNum - advance;
  document.getElementById("grandTotal").innerText = toFixed2(grandTotal);

  const amtReceived = parseFloat(document.getElementById("amtReceived").value) || 0;
  const netBalance = grandTotal - amtReceived;
  document.getElementById("netBalance").innerText = toFixed2(netBalance);
}

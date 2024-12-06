const form = document.getElementById("cashflow-form");
const tableBody = document.querySelector("#cashflow-table tbody");
const totalBalance = document.getElementById("total-balance");
let balance = 0;

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  if (description && !isNaN(amount)) {
    const row = document.createElement("tr");
    const typeText = type === "income" ? "Entrada" : "Saída";

    row.innerHTML = `
                    <td>${description}</td>
                    <td class="${type}">${typeText}</td>
                    <td class="${type}">R$ ${amount.toFixed(2)}</td>
                `;

    tableBody.appendChild(row);

    balance += type === "income" ? amount : -amount;
    totalBalance.textContent = `R$ ${balance.toFixed(2)}`;
    totalBalance.style.color = balance >= 0 ? "#2a8c44" : "#d14343";

    form.reset();
  }
});

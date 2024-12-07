import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
    authDomain: "orcamento-html.firebaseapp.com",
    projectId: "orcamento-html",
    storageBucket: "orcamento-html.appspot.com",
    messagingSenderId: "363402110339",
    appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
    measurementId: "G-ZMY6CHL8QW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserUID = null;

const yearSelect = document.getElementById("year-select");
const monthSelect = document.getElementById("month-select");
const applyFiltersButton = document.getElementById("apply-filters");

// Preencher os anos disponíveis no dropdown
// Preencher os anos disponíveis no dropdown
function populateYearDropdown() {
    const currentYear = new Date().getFullYear();

    // Adicionar a opção "Todos os anos"
    const allYearsOption = document.createElement("option");
    allYearsOption.value = "0";
    allYearsOption.textContent = "Todos os anos";
    yearSelect.appendChild(allYearsOption);

    // Adicionar os anos do atual até os últimos 10
    for (let year = currentYear; year >= 2023; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}


populateYearDropdown();

// Atualizar o resumo financeiro com base nos filtros
async function updateFinancialSummary() {
    if (!currentUserUID) return;

    const selectedYear = parseInt(yearSelect.value); // Ano selecionado
    const selectedMonth = parseInt(monthSelect.value); // Mês selecionado

    try {
        const userRecordsQuery = collection(db, "Fluxo", currentUserUID, "Registros");
        const querySnapshot = await getDocs(userRecordsQuery);

        let totalIncome = 0;
        let totalExpense = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const recordDate = new Date(data.data.seconds * 1000); // Timestamp para Date
            const recordYear = recordDate.getFullYear();
            const recordMonth = recordDate.getMonth() + 1;

            // Filtro: "Todos os anos" considera todos os anos, caso contrário, filtra pelo ano e mês
            if (
                (selectedYear === 0 || recordYear === selectedYear) &&
                (selectedMonth === 0 || recordMonth === selectedMonth)
            ) {
                if (data.tipo === "Entrada") {
                    totalIncome += parseFloat(data.valor) || 0;
                } else if (data.tipo === "Saída") {
                    totalExpense += parseFloat(data.valor) || 0;
                }
            }
        });

        const totalRevenue = totalIncome - totalExpense;

        document.querySelector(".sales h1").textContent = `R$${totalIncome.toFixed(2)}`;
        document.querySelector(".expenses h1").textContent = `R$${totalExpense.toFixed(2)}`;
        document.querySelector(".income h1").textContent = `R$${totalRevenue.toFixed(2)}`;
    } catch (error) {
        console.error("Erro ao atualizar o resumo financeiro:", error);
    }
}


// Adicionar evento ao botão de aplicar filtros
applyFiltersButton.addEventListener("click", updateFinancialSummary);

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserUID = user.uid;
        updateFinancialSummary();
    } else {
        alert("Por favor, faça login para acessar o painel.");
        window.location.replace("/Deslogar");
    }
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
        import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

        // Configuração do Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
            authDomain: "orcamento-html.firebaseapp.com",
            projectId: "orcamento-html",
            storageBucket: "orcamento-html.appspot.com",
            messagingSenderId: "363402110339",
            appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
            measurementId: "G-ZMY6CHL8QW"
        };

        // Inicializar Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

  
        const form = document.getElementById("Fluxo-form");
        const tableBody = document.querySelector("#Fluxo-table tbody");
        const totalBalance = document.getElementById("total-balance");
        const filterYear = document.getElementById("filter-year");
        const filterMonth = document.getElementById("filter-month");
        let balance = 0;
        let currentUserUID = null;

        const currentYear = new Date().getFullYear();

        // Adicionar a opção "Todos os anos"
        const allYearsOption = document.createElement("option");
        allYearsOption.value = ""; 
        allYearsOption.textContent = "Todos os anos";
        filterYear.appendChild(allYearsOption);
        for (let year = currentYear; year >= 2023; year--) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            filterYear.appendChild(option);
        }

        async function loadUserRecords() {
            if (!currentUserUID) return;

            const selectedYear = filterYear.value;
            const selectedMonth = filterMonth.value;

            const userRecordsQuery = collection(db, "Fluxo", currentUserUID, "Registros");
            try {
                const querySnapshot = await getDocs(userRecordsQuery);

                tableBody.innerHTML = ""; 
                balance = 0; 

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const recordDate = new Date(data.data.seconds * 1000);
                    const recordYear = recordDate.getFullYear();
                    const recordMonth = recordDate.getMonth() + 1;

                    
                    if (
                        (selectedYear === "" || recordYear == selectedYear) &&
                        (selectedMonth === "" || recordMonth == selectedMonth)
                    ) {
                        const typeText = data.tipo === "Entrada" ? "Entrada" : "Saída";
                        const valueColor = data.tipo === "Entrada" ? "green" : "red";

                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${data.descricao}</td>
                            <td>${typeText}</td>
                            <td style="color: ${valueColor};">R$ ${data.valor.toFixed(2)}</td>
                            <td><button onclick="deleteRecord('${doc.id}')">Excluir</button></td>
                        `;
                        tableBody.appendChild(row);

                        // Atualizar saldo
                        balance += data.tipo === "Entrada" ? data.valor : -data.valor;
                    }
                });

                // Atualizar saldo total
                totalBalance.textContent = `R$ ${balance.toFixed(2)}`;
                totalBalance.style.color = balance >= 0 ? "green" : "red";
            } catch (error) {
                console.error("Erro ao carregar os registros do usuário:", error);
            }
        }

        document.getElementById("filter-button").addEventListener("click", () => {
            loadUserRecords();
        });

        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUserUID = user.uid;
                loadUserRecords();
            } else {
                alert("Por favor, faça login para continuar.");
                window.location.replace("/Deslogar");
            }
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const description = document.getElementById("description").value;
            const amount = parseFloat(document.getElementById("amount").value);
            const type = document.getElementById("type").value;

            if (description && !isNaN(amount)) {
                try {
                    const tipo = type === "income" ? "Entrada" : "Saída";
                    await addDoc(collection(db, "Fluxo", currentUserUID, "Registros"), {
                        descricao: description,
                        valor: amount,
                        tipo: tipo,
                        data: new Date(),
                    });
                    loadUserRecords();
                    document.getElementById("description").value = "";
                    document.getElementById("amount").value = "";
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "Registro salvo com sucesso!",
                      showConfirmButton: false,
                      timer: 1500
                    });
                } catch (error) {
                    console.error("Erro ao salvar no Firestore:", error);
                    Swal.fire({
                      position: "center",
                      icon: "error",
                      title: "Erro ao salvar o registro!",
                      showConfirmButton: false,
                      timer: 1500
                    });
                }
            }
        });

        async function deleteRecord(docId) {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
          });
          swalWithBootstrapButtons.fire({
            title: "Você tem certeza?",
            text: "Não será possivel recuperar o registro!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, deletar!",
            cancelButtonText: "Não, cancelar!",
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
               deleteDoc(doc(db, "Fluxo", currentUserUID, "Registros", docId));
                  loadUserRecords();
              swalWithBootstrapButtons.fire({
                title: "Deletado!",
                text: "O registro foi deletado com sucesso.",
                icon: "success"
              });
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire({
                title: "Cancelado!",
                text: "O registro permanece.",
                icon: "error"
              });
            }
          });
        }
        window.deleteRecord = deleteRecord;



        
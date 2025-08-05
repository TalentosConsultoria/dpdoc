// ---------------------- Funções Comuns ----------------------
function readWorkbook(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

// Função de normalização de nomes para garantir correspondência exata
function normalizeName(name) {
    if (!name) return "";
    return String(name)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase();
}

// Função de normalização de CPF para garantir 11 dígitos com zeros à esquerda
function normalizeCPF(cpf) {
    if (!cpf) return '';
    const cleanCpf = String(cpf).replace(/\D/g, '');
    return cleanCpf.padStart(11, '0');
}

// Nova função para formatar o CPF
function formatCPF(cpf) {
    if (!cpf || cpf.length !== 11 || cpf === "Não encontrado") return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// ---------------------- Lógica do Passo 1 ----------------------
const file1InputPart1 = document.getElementById('file1Part1');
const file2InputPart1 = document.getElementById('file2Part1');
const processBtn1 = document.getElementById('processBtn1');
const downloadBtn1 = document.getElementById('downloadBtn1');
const status1Div = document.getElementById('status1');
let processedData1 = null;

function checkFiles1() {
    processBtn1.disabled = !(file1InputPart1.files.length > 0 && file2InputPart1.files.length > 0);
}
file1InputPart1.addEventListener('change', checkFiles1);
file2InputPart1.addEventListener('change', checkFiles1);

processBtn1.addEventListener('click', async () => {
    status1Div.textContent = 'Processando...';
    processBtn1.disabled = true;
    downloadBtn1.style.display = 'none';
    
    try {
        const data1 = await readWorkbook(file1InputPart1.files[0]);
        const data2 = await readWorkbook(file2InputPart1.files[0]);

        if (data1.length === 0 || data2.length === 0) {
            throw new Error('Uma das planilhas está vazia.');
        }
        
        const cpfMap = new Map();
        for (let i = 1; i < data2.length; i++) {
            const nome = data2[i][3]; // Coluna D
            const cpf = data2[i][6];  // Coluna G
            if (nome && cpf) {
                const nomeNormalizado = normalizeName(nome);
                cpfMap.set(nomeNormalizado, String(cpf));
            }
        }

        processedData1 = data1.map((row, index) => {
            if (index === 0) {
                return ["Matrícula", "Unidade", "Empregado", "Admissao", "CPF", "Documento", "Status"];
            }

            const nomeEmpregado = row[2]; // Coluna C
            const unidade = row[1]; // Coluna B
            const documento = row[4]; // Coluna E
            const status = row[5]; // Coluna F

            let cpfEncontrado = "Não encontrado";
            if (nomeEmpregado) {
                const nomeNormalizado = normalizeName(nomeEmpregado);
                cpfEncontrado = cpfMap.get(nomeNormalizado) || "Não encontrado";
            }
            
            return [
                "",               
                unidade,          
                nomeEmpregado,    
                "",               
                cpfEncontrado,    
                documento,        
                status            
            ];
        });

        status1Div.textContent = 'Processamento do Passo 1 concluído!';
        downloadBtn1.style.display = 'block';

    } catch (error) {
        status1Div.textContent = `Erro: ${error.message}. Verifique se os arquivos e as colunas estão corretos.`;
        console.error("ERRO DURANTE O PROCESSAMENTO:", error);
    } finally {
        processBtn1.disabled = false;
    }
});

downloadBtn1.addEventListener('click', () => {
    if (processedData1) {
        const dataToDownload = processedData1.map((row, index) => {
            if (index === 0) return row;
            const newRow = [...row];
            newRow[4] = formatCPF(normalizeCPF(row[4]));
            return newRow;
        });

        const ws = XLSX.utils.aoa_to_sheet(dataToDownload);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Planilha Ajustada");
        XLSX.writeFile(wb, "planilha_ajustada.xlsx");
    }
});

// ---------------------- Lógica do Passo 2 ----------------------
const file1InputPart2 = document.getElementById('file1Part2');
const file2InputPart2 = document.getElementById('file2Part2');
const processBtn2 = document.getElementById('processBtn2');
const downloadBtn2 = document.getElementById('downloadBtn2');
const status2Div = document.getElementById('status2');
let processedData2 = null;

function checkFiles2() {
    processBtn2.disabled = !(file1InputPart2.files.length > 0 && file2InputPart2.files.length > 0);
}
file1InputPart2.addEventListener('change', checkFiles2);
file2InputPart2.addEventListener('change', checkFiles2);

processBtn2.addEventListener('click', async () => {
    status2Div.textContent = 'Processando...';
    processBtn2.disabled = true;
    downloadBtn2.style.display = 'none';
    
    try {
        const data1 = await readWorkbook(file1InputPart2.files[0]);
        const data2 = await readWorkbook(file2InputPart2.files[0]);

        if (data1.length === 0 || data2.length === 0) {
            throw new Error('Uma das planilhas está vazia.');
        }
        
        const dataMap = new Map();
        for (let i = 1; i < data2.length; i++) {
            const cpf = data2[i][15];
            const matricula = data2[i][0];
            const dataAdmissao = data2[i][7];
            if (cpf) {
                dataMap.set(normalizeCPF(cpf), { matricula: matricula, admissao: dataAdmissao });
            }
        }

        processedData2 = data1.map((row, index) => {
            if (index === 0) {
                return row;
            }

            const cpfDaPlanilha1 = row[4];
            
            if (cpfDaPlanilha1) {
                const cpfNormalizado = normalizeCPF(cpfDaPlanilha1);
                const dadosEncontrados = dataMap.get(cpfNormalizado);
                
                if (dadosEncontrados) {
                    row[0] = dadosEncontrados.matricula;
                    row[3] = dadosEncontrados.admissao;
                } else {
                    row[0] = "ND";
                }
            } else {
                row[0] = "ND";
            }

            return row;
        });

        status2Div.textContent = 'Processamento do Passo 2 concluído!';
        downloadBtn2.style.display = 'block';

    } catch (error) {
        status2Div.textContent = `Erro: ${error.message}. Por favor, verifique se os arquivos e as colunas estão corretas.`;
        console.error("ERRO DURANTE O PROCESSAMENTO:", error);
    } finally {
        processBtn2.disabled = false;
    }
});

downloadBtn2.addEventListener('click', () => {
    if (processedData2) {
        const dataToDownload = processedData2.map((row, index) => {
            if (index === 0) return row;
            const newRow = [...row];
            newRow[4] = formatCPF(normalizeCPF(row[4]));
            return newRow;
        });
        const ws = XLSX.utils.aoa_to_sheet(dataToDownload);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Planilha Final");
        XLSX.writeFile(wb, "planilha_final.xlsx");
    }
});
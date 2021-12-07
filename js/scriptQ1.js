var formula = document.querySelector("#formula")
var btn_gerar = document.createElement("input")
var divResul = document.querySelector("#resul")
var divTabela = document.querySelector("#tabela")

var subformulas = [] //Guarda todas as subfórmulas

btn_gerar.setAttribute("type", "submit")
btn_gerar.setAttribute("id", "btnGerar")
btn_gerar.setAttribute("value", "Gerar")

divResul.style.display = "none";

document.querySelector("#formulario").append(btn_gerar)

function verificaSimboloAtomico(s) {
    if (s.length != 1) return false

    var n = s.charCodeAt(0) //pega o código da tabela ASCII
    //verifica se é letra minuscula do alfabeto (de a = 97 até z = 122)
    if (n >= 97 && n <= 122) return true
    else return false
}
//Verifica se os parênteses estão balanceados
function verificaBalanco(s) {
    var erro = 0, abre = 0, i = 0

    while (i < s.length) {
        if (s[i] == '(' && s[i + 1] == ')') {//Se estiver vazio dentro dos parênteses
            erro = 1
            break
        }
        if (s[i] == '(') abre++
        if (s[i + 1] == ')')
            if (abre > 0) abre--
            else { //Se estiver fechando sem ter parêntese aberto
                erro = 1
                break
            }
        i++
    }

    if (erro == 1 || abre > 0) return false //Se tem erro ou se tem parênteses aberto que não foi fechado

    return true
}
//Retorna o índice do operador que vai ser usado
function conectorPrioritario(s) {
    var ordemPrioridade = []
    var i = s.length - 1

    while (i >= 0) { // preenche o vetor com os ínidices dos de todos os conectores binários presentes na fórmula
        if (s[i] == "&" || s[i] == "#" || s[i] == ">")
            ordemPrioridade.push(i)
        i--
    }
    //Percorre os conectores e verifica qual divide a formula em duas sem ter problema de balanceamento de parênteses
    for (i = 0; i < ordemPrioridade.length; i++)
        if (verificaBalanco(s.slice(1, ordemPrioridade[i])) &&
            verificaBalanco(s.slice(ordemPrioridade[i] + 1, s.length - 1)))
            return ordemPrioridade[i]

    return -1
}

function verificaFormula(s) {
    subformulas.push(s)
    if (verificaSimboloAtomico(s))
        return true

    if (s[0] == '−')
        return verificaFormula(s.slice(1, s.length))

    var conector = conectorPrioritario(s)

    if (conector != -1 && s[0] == '(' && s[s.length - 1] == ')')//se tem conector e está entre parênteses
        return verificaFormula(s.slice(1, conector)) && verificaFormula(s.slice(conector + 1, s.length - 1))

    return false
}

function calculaComplexidade(s) {
    const simbProp = ['−', '&', '#', '>']
    var cont = 0
    for (i = 0; i < s.length; i++)
        if (simbProp.indexOf(s[i]) != -1 || verificaSimboloAtomico(s[i]))
            cont++

    return cont
}

function contaSimbAtom(sf) {
    var cont = 0
    for (i = 0; i < sf.length; i++) {
        if (verificaSimboloAtomico(sf[i])) {
            cont++
        }
    }

    return cont
}

function ordenaSubFormulas(sf) {

    var cpxSf = [] //Guarda a complexidade das subformulas
    var i = 0
    while (i < sf.length) {//Preenche cpxSf com a complexidade de cada subformula no índices referentes 
        cpxSf.push(calculaComplexidade(sf[i]))
        i++
    }
    //Ordena as complexidades e as subformulas, da menor para a maior
    var aux
    for (i = 0; i < sf.length; i++) {
        for (j = 0; j < sf.length - 1; j++) {
            if (cpxSf[j] > cpxSf[j + 1]) {
                aux = sf[j]
                sf[j] = sf[j + 1]
                sf[j + 1] = aux

                aux = cpxSf[j]
                cpxSf[j] = cpxSf[j + 1]
                cpxSf[j + 1] = aux
            }
        }
    }

    return sf
}
//Quando clica no botão "Gerar"
btn_gerar.onclick = function () {
    if (verificaFormula(formula.value)) {
        divResul.style.display = "block";
        divResul.style.backgroundColor = "#fff"
        divResul.style.padding = "0px 0px 0px 0px"
        //Remove as subformulas repetidas
        subformulas = subformulas.filter(
            function (subformula, pos, self) {
                return self.indexOf(subformula) == pos
            }
        )
        subformulas = ordenaSubFormulas(subformulas);
        var totalSimAtom = contaSimbAtom(subformulas)
        var totalLinhas = Math.pow(2, totalSimAtom)
        //Guarda o operador/conector prioritário de cada subformula
        var operadorSub = []
        for (i = 0; i < subformulas.length; i++) {
            if (!verificaSimboloAtomico(subformulas[i])) {
                operadorSub.push(subformulas[i][conectorPrioritario(subformulas[i])])
            } else {
                operadorSub.push(null)
            }
        }
        //Matriz que guarda a valoração das subformulas
        var valoresTab = []
        var temp = []
        var dividendo = totalLinhas
        var valor = 1
        var f1, f2
        for (i = 0; i < subformulas.length; i++) {
            dividendo = dividendo / 2
            for (j = 0; j < totalLinhas; j++) {
                //Preenche com os valores 0 e 1
                if (verificaSimboloAtomico(subformulas[i])) {
                    if (j % dividendo == 0) {
                        if (valor == 1) {
                            valor = 0
                        } else {
                            valor = 1
                        }
                    }
                    temp.push(valor)
                } else {
                    if (subformulas[i][0] == '−') {//Negação
                        f1 = subformulas.indexOf(subformulas[i].slice(1, subformulas[i].length))
                        if (valoresTab[f1][j] == 1) {
                            temp.push(0)
                        } else if (valoresTab[f1][j] == 0) {
                            temp.push(1)
                        }
                    }
                    else {//Conectivos binários
                        f1 = subformulas.indexOf((subformulas[i].slice(1, conectorPrioritario(subformulas[i]))))
                        f2 = subformulas.indexOf(subformulas[i].slice(conectorPrioritario(subformulas[i]) + 1, subformulas[i].length - 1))

                        switch (operadorSub[i]) {
                            case '&':
                                if (valoresTab[f1][j] == 1 && valoresTab[f2][j] == 1) {
                                    temp.push(1)
                                } else {
                                    temp.push(0)
                                }
                                ;
                                break;
                            case '#':
                                if (valoresTab[f1][j] == 1 || valoresTab[f2][j] == 1) {
                                    temp.push(1)
                                } else {
                                    temp.push(0)
                                }
                                ; break;
                            case '>':
                                if (valoresTab[f1][j] == 1 && valoresTab[f2][j] == 0) {
                                    temp.push(0)
                                } else {
                                    temp.push(1)
                                }
                                ; break;
                        }
                    }
                }
            }
            valoresTab.push(temp)
            temp = []
        }
        //Analisa os valores da formula digitada (última subformula)
        if (valoresTab[subformulas.length - 1].indexOf(1) != -1) {//Se tem pelo menos um verdadeiro
            if (valoresTab[subformulas.length - 1].indexOf(0) == -1) { // Se não tem falso
                document.querySelector("#resultado").innerHTML = "É satisfazível e válida.<hr>"
            } else { // Se tem pelo menos um falso
                document.querySelector("#resultado").innerHTML = "É satisfazível e falsificável.<hr>"
            }
        } else { //Se não tem verdadeiro
            document.querySelector("#resultado").innerHTML = "É falsificável e insatisfazível.<hr>"
        }


        //Guarda a estrutura da tabela
        var tabVerdade = "<table class='tbVerdade'>"
        //Cabeçalho
        tabVerdade += "<thead><tr>"

        for (i = 0; i < subformulas.length; i++) {
            tabVerdade += "<th>" + subformulas[i] + "</th>"
        }

        tabVerdade += "</tr></thead><tbody>"

        //Corpo
        for (i = 0; i < totalLinhas; i++) {
            tabVerdade += "<tr>"
            for (j = 0; j < subformulas.length; j++) {
                if (j == subformulas.length - 1)
                    tabVerdade += "<td style='background-color: #dff'>" + valoresTab[j][i] + "</td>"
                else
                    tabVerdade += "<td>" + valoresTab[j][i] + "</td>"
            }
            tabVerdade += "</tr>"
        }

        tabVerdade += "<tbody></table>"
        //Mostra a tabela
        divTabela.innerHTML = tabVerdade

    } else {
        divResul.style.padding = "10px 3px 10px 5px"
        divResul.style.display = "block";
        if (formula.value == "") {
            divResul.style.backgroundColor = "	#EEE8AA"
            document.querySelector("#resultado").innerHTML = "Insira uma fórmula."
        } else {
            divResul.style.backgroundColor = "#ffa8a8"
            document.querySelector("#resultado").innerHTML = "Fórmula inválida."
        }
        divTabela.innerHTML = ""
    }
    subformulas = []
}
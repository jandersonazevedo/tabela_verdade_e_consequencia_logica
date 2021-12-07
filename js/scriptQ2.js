var formula = document.querySelector("#formula_consequencia")
var gama = document.querySelector("#gama")
var btn_verificar = document.createElement("input")
var divResul = document.querySelector("#resul")
var divTabela = document.querySelector("#tabela")

var subformulas = []

btn_verificar.setAttribute("type", "submit")
btn_verificar.setAttribute("id", "btnGerar")
btn_verificar.setAttribute("value", "Verificar")

divResul.style.display = "none";

document.querySelector("#formulario").append(btn_verificar)

function verificaSimboloAtomico(s) {
    if (s.length != 1) return false

    var n = s.charCodeAt(0)

    if (n >= 97 && n <= 122) return true
    else return false
}

function verificaBalanco(s) {
    var erro = 0, abre = 0, i = 0

    while (i < s.length) {
        if (s[i] == '(' && s[i + 1] == ')') {
            erro = 1
            break
        }
        if (s[i] == '(') abre++
        if (s[i + 1] == ')')
            if (abre > 0) abre--
            else {
                erro = 1
                break
            }
        i++
    }

    if (erro == 1 || abre > 0) return false

    return true
}

function conectorPrioritario(s) {
    var ordemPrioridade = []
    var i = s.length - 1

    while (i >= 0) {
        if (s[i] == "&" || s[i] == "#" || s[i] == ">")
            ordemPrioridade.push(i)
        i--
    }

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

    if (conector != -1 && s[0] == '(' && s[s.length - 1] == ')')
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

function ordenaSimbAtom(sf) {

    var cpxSf = [];
    var i = 0
    while (i < sf.length) {
        cpxSf.push(calculaComplexidade(sf[i]))
        i++
    }

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

function verificaFormulasGama(g) {
    for (i = 0; i < g.length; i++) {
        if (!verificaFormula(g[i]))
            return false
    }
    return true
}

btn_verificar.onclick = function () {
    var formulas_gama = gama.value.replace(/\s/g, '').split(",") //Separa as formulas de gama

    if (verificaFormulasGama(formulas_gama) && verificaFormula(formula.value)) {
        divResul.style.display = "block";
        divResul.style.backgroundColor = "#fff"
        divResul.style.padding = "0px 0px 0px 0px"
        
        subformulas = subformulas.filter(
            function (subformula, pos, self) {
                return self.indexOf(subformula) == pos
            }
        )
        subformulas = ordenaSimbAtom(subformulas);
        var totalSimAtom = contaSimbAtom(subformulas)
        var totalLinhas = Math.pow(2, totalSimAtom)

        var operadorSub = []
        for (i = 0; i < subformulas.length; i++) {
            if (!verificaSimboloAtomico(subformulas[i])) {
                operadorSub.push(subformulas[i][conectorPrioritario(subformulas[i])])
            } else {
                operadorSub.push(null)
            }
        }

        var valoresTab = []
        var temp = []
        var dividendo = totalLinhas
        var valor = 1
        var f1, f2
        for (i = 0; i < subformulas.length; i++) {
            dividendo = dividendo / 2
            for (j = 0; j < totalLinhas; j++) {
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
                    if (subformulas[i][0] == '−') {
                        f1 = subformulas.indexOf(subformulas[i].slice(1, subformulas[i].length))
                        if (valoresTab[f1][j] == 1) {
                            temp.push(0)
                        } else if (valoresTab[f1][j] == 0) {
                            temp.push(1)
                        }
                    }
                    else {
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
        //Faz a transposta da tabela de valores das formulas de gama
        var transpostaValoresTab = []
        var temp = []

        for (i = 0; i < totalLinhas; i++) {
            for (j = 0; j < valoresTab.length; j++) {
                if(formulas_gama.indexOf(subformulas[j]) != -1){
                    temp.push(valoresTab[j][i])
                }
            }
            transpostaValoresTab.push(temp)
            temp = []
        }
        //Primeiramente o resultado é definido como válido
        var resultado = "<b class='gama'>Γ</b> " + "<span class='formulaC'>|−</span> <b>" + formula.value + "</b> é válido"
        var explicacao = "<dl>"
        var valoracaoInsatisfaz = []
        var v = ""      
        for (j = 0; j < totalLinhas; j++) {
            //Verifica a consequência em cada linha
            //Se nas premissas a valoração for verdadeira e na fórmula for falsa
            if (transpostaValoresTab[j].indexOf(0) == -1 && valoresTab[subformulas.indexOf(formula.value)][j] == 0) {
                explicacao = "<br><dt>Não satisfaz nas valorações: </dt>"
                for (k = 0; k < totalSimAtom; k++) {
                    v += "v(<b>" + subformulas[k] + "</b>) = " + valoresTab[k][j]
                    if (k != totalSimAtom - 1)
                        v += "; "
                    else
                        v += "."
                }
                valoracaoInsatisfaz.push(v)
                v = ""
                resultado = "<b class='gama'>Γ</b> " + "<span class='formulaC'>|−</span> <b>" + formula.value + "</b> não é válido"
            }
        }
        //Remove as valorações repetidas
        valoracaoInsatisfaz = valoracaoInsatisfaz.filter(
            function (valoracao, pos, self) {
                return self.indexOf(valoracao) == pos
            }
        )
        //para listar as valorações que não satisfazem
        for (i = 0; i < valoracaoInsatisfaz.length; i++) {
            explicacao += "<dd>• " + valoracaoInsatisfaz[i] + "</dd>";
        }

        explicacao += "</dl><hr>"
        //Exibe o resultado
        document.querySelector("#resultado").innerHTML = resultado + "." + explicacao + ""


        //Mostra Tabela
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
                    tabVerdade += "<td>" + valoresTab[j][i] + "</td>"
            }
            tabVerdade += "</tr>"
        }

        tabVerdade += "<tbody></table>"

        divTabela.innerHTML = tabVerdade

    } else {
        divResul.style.padding = "10px 3px 10px 5px"
        divResul.style.display = "block";
        if (formula.value == "" || formulas_gama == "") {
            divResul.style.backgroundColor = "	#EEE8AA"
            document.querySelector("#resultado").innerHTML = "Insira as fórmulas."
        } else {
            divResul.style.backgroundColor = "#ffa8a8"
            document.querySelector("#resultado").innerHTML = "Ops... Confira as fórmulas e tente novamente."
        }
        divTabela.innerHTML = ""
    }
    subformulas = []
}
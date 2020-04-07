var canvas, context, alt, larg, frames = 0, maxPulos = 3, velocidade = 6, estadoAtual,

    estados = {
        jogar: 0,
        jogando: 1,
        perdeu: 2
    },

    chao = {
        y: 550,
        altura: 50,
        cor: "#ffdf70",
        desenha: function () {
            context.fillStyle = this.cor,
                context.fillRect(0, this.y, larg, this.altura)
        }
    },

    bloco = {
        x: 50,
        y: 0,
        altura: 50,
        largura: 50,
        cor: "#ff9239",
        gravity: 1.6,
        velocity: 0,
        forcaDoPulo: 23.9,
        qntPulos: 0,
        score: 0,
        atualiza: function () {
            this.velocity += this.gravity
            this.y += this.velocity

            if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu) {
                this.y = chao.y - this.altura
                this.qntPulos = 0
                this.velocity = 0
            }
        },
        pula: function () {
            if (this.qntPulos < maxPulos) {
                this.velocity = -this.forcaDoPulo
                this.qntPulos++
            }
        },
        desenha: function () {
            context.fillStyle = this.cor
            context.fillRect(this.x, this.y, this.largura, this.altura)
        },
        reset: function() {
            this.velocity = 0
            this.y = 0
            this.score = 0

        }
    },

    obstaculos = {
        _obs: [],
        cores: ["#ffbc1c", "#ff1c1c", "#ff85e1", "#52a7ff", "#78ff5d"],
        tempoInsere: 0,
        insere: function () {
            this._obs.push({
                x: larg,
                //largura: 30 + Math.floor(21 * Math.random()),
                largura: 50,
                altura: 30 + Math.floor(120 * Math.random()),
                cor: this.cores[Math.floor(5 * Math.random())]
            })

            this.tempoInsere = 50 + Math.floor(30 * Math.random())
        },
        atualiza: function () {
            if (this.tempoInsere == 0) {
                this.insere()
            } else {
                this.tempoInsere--
            }
            for (var i = 0, tam = this._obs.length; i < tam; i++) {
                var obs = this._obs[i]
                obs.x -= velocidade

                if (bloco.x < obs.x + obs.largura && bloco.x + bloco.largura >= obs.x && bloco.y + bloco.altura >= chao.y - obs.altura) {
                    estadoAtual = estados.perdeu
                } else if (obs.x == 0) {
                    bloco.score++
                }

                if (obs.x <= -obs.largura) {
                    this._obs.splice(i, 1)
                    tam--
                    i--
                }
            }
        },

        limpa: function() {
            this._obs = []
        },

        desenha: function () {
            for (var i = 0, tam = this._obs.length; i < tam; i++) {
                var obs = this._obs[i]
                context.fillStyle = obs.cor
                context.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura)
            }
        }
    }

function create() { //cria o layout
    context.fillStyle = "#50beff"
    context.fillRect(0, 0, larg, alt)

    context.fillStyle = "#ffffff"
    context.font = "50px Arial"
    context.fillText(bloco.score, 5, 42)

    if (estadoAtual == estados.jogar) {
        context.fillStyle = "green"
        context.fillRect(larg / 2 - 50, alt / 2 - 50, 100, 100) //elimina metade para o centro do quadrado ficar alinhado com o centro do canvas
    } else if (estadoAtual == estados.perdeu) {
        context.fillStyle = "red"
        context.fillRect(larg / 2 - 50, alt / 2 - 50, 100, 100)

        context.save()
        context.translate(larg / 2, alt / 2)
        context.fillStyle = "#ffffff"

        if (bloco.score < 10) {
            context.fillText(bloco.score, -13, 19)
        } else if (bloco.score >= 10 && bloco.score < 100) {
            context.fillText(bloco.score, -26, 19)
        } else {
            context.fillText(bloco.score, -39, 19)            
        }
        
        context.restore()
    } else if (estadoAtual == estados.jogando) {
        obstaculos.desenha()
    }
    
    chao.desenha()    
    bloco.desenha()
}

function click(e) { //identificar se a pessoa clicou
    if (estadoAtual == estados.jogando) {
        bloco.pula()
    } else if (estadoAtual == estados.jogar) {
        estadoAtual = estados.jogando
    } else if (estadoAtual == estados.perdeu && bloco.y >= 2 * alt) {
        estadoAtual = estados.jogar
        obstaculos.limpa()
        bloco.reset()
    }    
}

function start() { //pra rodar o jogo
    update()
    create()

    window.requestAnimationFrame(start)
}

function update() { //atualizar status do personagem e dos blocos
    frames++
    bloco.atualiza()

    if (estadoAtual == estados.jogando) {        
        obstaculos.atualiza()
    }
}

function main() {  //funçao principal
    alt = window.innerHeight //pega a altura da janela do usuário
    larg = window.innerWidth

    if (larg >= 500) {
        larg = 600
        alt = 600
    }

    canvas = document.createElement("canvas")
    canvas.width = larg
    canvas.height = alt
    canvas.style.border = "1px solid #000"

    context = canvas.getContext("2d")
    document.body.appendChild(canvas)

    document.addEventListener("mousedown", click) //sempre que tiver um clique chama a função click

    estadoAtual = estados.jogar
    start()
}

main() //inicializa o jogo
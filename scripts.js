var canvas, context, alt, larg, maxPulos = 3, velocidade = 6, estadoAtual, record, img, pontosParaNovaFase = [5, 10, 15, 20], faseAtual = 0,

    labelNovaFase = {
        texto: "",
        opacidade: 0.0,
        fadeIn: function(dt) {
            var fadeInId = setInterval(function() {
                if (labelNovaFase.opacidade < 1.0) {
                    labelNovaFase.opacidade += 0.01
                } else {
                    clearInterval(fadeInId)
                }
            }, 10 * dt)
        },
        fadeOut: function(dt) {
            var fadeOutId = setInterval(function() {
                if (labelNovaFase.opacidade > 0.0) {
                    labelNovaFase.opacidade -= 0.01
                } else {
                    clearInterval(fadeOutId)
                }
            }, 10 * dt)
        }
    },

    estados = {
        jogar: 0,
        jogando: 1,
        perdeu: 2
    },

    chao = {
        y: 550,
        x: 0,
        altura: 50,
        atualiza: function() {
            this.x -= velocidade
            if (this.x <= -30) {
                this.x += 30
            }
        },
        desenha: function () {
            spriteChao.desenha(this.x, this.y)
            spriteChao.desenha(this.x + spriteChao.largura, this.y)
        }
    },

    bloco = {
        x: 50,
        y: 0,
        altura: spriteCharacter.altura,
        largura: spriteCharacter.altura,
        gravity: 1.6,
        velocity: 0,
        forcaDoPulo: 23.9,
        qntPulos: 0,
        score: 0,
        rotacao: 0,
        vidas: 3,
        colidindo: false,
        atualiza: function () {
            this.velocity += this.gravity
            this.y += this.velocity
            this.rotacao += Math.PI / 180 * velocidade

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
            //context.fillStyle = this.cor
            //context.fillRect(this.x, this.y, this.largura, this.altura)
            context.save()
            context.translate(this.x + this.largura / 2, this.y + this.largura / 2)
            context.rotate(this.rotacao)
            spriteCharacter.desenha(-this.largura / 2, -this.altura / 2)
            context.restore()
        },
        reset: function() {
            this.velocity = 0
            this.y = 0
            
            if (this.score > record) {
                localStorage.setItem("record", this.score)
                record = this.score
            }

            this.vidas = 3
            this.score = 0
            this.gravity = 1.6

            velocidade = 6
            faseAtual = 0
        }
    },

    obstaculos = {
        _obs: [],
        _scored: false,
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

                if (!bloco.colidindo && obs.x <= bloco.x + bloco.largura && bloco.x <= obs.x + obs.largura && chao.y - obs.altura <= bloco.y + bloco.altura) {
                    bloco.colidindo = true

                    setTimeout(function() {
                        bloco.colidindo = false
                    }, 500)

                    if (bloco.vidas >= 1) {
                        bloco.vidas--
                    } else {
                        estadoAtual = estados.perdeu
                    }
                } else if (obs.x <= 0 && !obs._scored) {
                    bloco.score++
                    obs._scored = true

                    if (faseAtual < pontosParaNovaFase.length && bloco.score == pontosParaNovaFase[faseAtual]) {
                        passarDeFase()
                    }
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
    // context.fillStyle = "#80daff"
    // context.fillRect(0, 0, larg, alt)
    bg.desenha(0, 0)

    context.fillStyle = "#ffffff"
    context.font = "50px Arial"
    context.fillText(bloco.score, 5, 42)
    context.fillText(bloco.vidas, 568, 42)

    context.fillStyle = "rgba(0, 0, 0, " + labelNovaFase.opacidade + ")"
    context.fillText(labelNovaFase.texto, canvas.width / 2.7, canvas.height / 3)

    if (estadoAtual == estados.jogando) {
        obstaculos.desenha()
    }

    chao.desenha()    
    bloco.desenha()

    if (estadoAtual == estados.jogar) {
        jogar.desenha(larg / 2 - jogar.largura / 2, alt / 2 - jogar.altura / 2)
    }

    if (estadoAtual == estados.perdeu) {
        perdeu.desenha(larg / 2 - perdeu.largura / 2, alt / 2 - perdeu.altura / 2 - spriteRecord.altura / 2)

        spriteRecord.desenha(larg / 2 - spriteRecord.largura / 2, alt / 2 + perdeu.altura / 2 - spriteRecord.altura / 2 - 25)

        if (bloco.score > record) {
            novo.desenha(larg / 2 - 180, alt / 2 + 30)
            context.fillText(bloco.score, 420, 470)
        } else {
            context.fillText(bloco.score, 395, 390)
            context.fillText(record, 420, 470)
        }
    }
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
    if (estadoAtual == estados.jogando) {        
        obstaculos.atualiza()
    }

    chao.atualiza()
    bloco.atualiza()
}

function passarDeFase() {
    velocidade++
    faseAtual++
    bloco.vidas++

    if (faseAtual == 4) {
        bloco.gravity *= 0.6
    }

    labelNovaFase.texto = `Level ${faseAtual}`
    labelNovaFase.fadeIn(0.4)

    setTimeout(function() {
        labelNovaFase.fadeOut(0.4)
    }, 800)    
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
    record = localStorage.getItem("record")

    if (record == null) {
        record = 0
    }

    img = new Image()
    img.src = "sheet.png"

    start()
}

main() //inicializa o jogo
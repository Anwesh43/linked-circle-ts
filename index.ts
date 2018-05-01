const w : number = window.innerWidth, h : number = window.innerHeight
const colors : Array<string> = ["#2ecc71" , "#e74c3c", "#1abc9c", "#f1c40f", "#3498db"]

function drawArc(context: CanvasRenderingContext2D, i : number) {
    context.fillStyle = colors[i]
    context.beginPath()
    context.arc(w/2, h/2, Math.min(w, h)/10, 0, 2 * Math.PI)
    context.fill()
}

class LinkedCircleStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    linkedCircle : LinkedCircle = new LinkedCircle()
    animator : Animator = new Animator()
    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedCircle.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedCircle.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedCircle.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0
    update(stopcb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.prevScale = this.scale + this.dir
            this.dir = 0
            stopcb()
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(updatecb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LCNode {
    next : LCNode
    prev : LCNode
    state : State = new State()
    constructor(public i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            const NODE = new LCNode(this.i+1)
            this.next = NODE
            NODE.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        context.save()
        context.translate(0, h/2 * (1 - 2 * this.state.scale))
        drawArc(context, this.i)
        context.save()
        context.translate(h/2, 0)
        if (this.next) {
            this.next.draw(context)
        }
        context.restore()
        context.restore()
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir, cb) {
        var curr : LCNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedCircle {
    curr : LCNode = new LCNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}

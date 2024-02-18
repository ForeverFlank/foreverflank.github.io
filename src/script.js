"use strict";

function wrap(x, a, b) {
    let range = b - a;
    let result = x % range;
    if (result < a) result += range;
    if (result > b) result -= range;
    return result;
}
function distanceSquared(u, v) {
    return (u.x - v.x) ** 2 + (u.y - v.y) ** 2;
}

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

const maxDistance = 150;
const maxDistanceSquared = maxDistance * maxDistance;
let nodes = [];
let startTime = Date.now();

class BgNode {
    constructor(i) {
        this.id = i;
        this.x = (Math.random() * 1.5 - 0.25) * canvas.width;
        this.y = (Math.random() * 1.5 - 0.25) * canvas.height;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.adj = [];
        this.updateSector();
    }
    updateSector() {
        this.sector = [
            Math.floor(this.x / maxDistance),
            Math.floor(this.y / maxDistance),
        ];
    }
    connect() {
        this.adj = this.adj.filter(
            (n) => distanceSquared(this, n) <= maxDistanceSquared
        );

        let nodesToConnect = nodes.filter(
            (node) =>
                Math.abs(node.sector[0] - this.sector[0]) <= 1 &&
                Math.abs(node.sector[1] - this.sector[1]) <= 1
        );
        nodesToConnect.forEach((n) => {
            if (distanceSquared(this, n) <= maxDistanceSquared) {
                this.adj.push(n);
            }
        });
        this.adj = this.adj.filter(
            (obj, index) => this.adj.findIndex((x) => x.id === obj.id) === index
        );
    }
    update() {
        this.x = wrap(
            this.x + this.vx,
            -0.25 * canvas.width,
            1.25 * canvas.width
        );
        this.y = wrap(
            this.y + this.vy,
            -0.25 * canvas.width,
            1.25 * canvas.height
        );
        this.updateSector();
    }
}

function generateNodes() {
    nodes = [];
    for (let i = 0; i < (canvas.width * canvas.height) / 3000; i++) {
        nodes.push(new BgNode(i));
    }
}

function resize() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    generateNodes();
}
resize();

function background() {
    let opacity = Math.min(1,
        Math.max(0, (Date.now() - startTime) / 1000 - 0.5))
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = ctx.fillStyle = `rgb(40, 40, 40, ${opacity})`;
    nodes.forEach((n) => {
        n.update();
        n.adj.forEach((m) => {
            let d2 = distanceSquared(n, m);
            if (d2 > maxDistanceSquared) return;
            ctx.lineWidth = 1.1 * (1 - Math.sqrt(d2) / maxDistance);
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    });
}

generateNodes();

function backgroundConnect() {
    nodes.forEach((n) => n.connect());
}
backgroundConnect();

window.addEventListener("resize", resize);

setInterval(backgroundConnect, 300);
setInterval(background, 1000 / 30);

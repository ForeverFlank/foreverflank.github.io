"use strict";

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let size = 13;
let grid = [];
let lerpGrid = [];
let initialized = false;
let initChance = 0.2;

function initGrid() {
    grid = Array(size).fill().map(_ => Array(size).fill(0));
    lerpGrid = Array(size).fill().map(_ => Array(size).fill(0));
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            grid[i][j] = Math.random() > initChance ? 0 : 1;
        }
    }
}

function resizeGrid(newSize) {
    if (size > newSize) {
        grid = grid.slice(0, newSize).map(row => row.slice(0, newSize));
        lerpGrid = lerpGrid.slice(0, newSize).map(row => row.slice(0, newSize));
    } else if (size < newSize) {
        for (let i = 0; i < size; i++) {
            for (let j = size; j < newSize; j++) {
                grid[i].push(Math.random() > initChance ? 0 : 1);
                lerpGrid[i].push(0);
            }
        }

        for (let i = size; i < newSize; i++) {
            const newGridRow = [];
            const newLerpRow = [];
            for (let j = 0; j < newSize; j++) {
                newGridRow.push(Math.random() > initChance ? 0 : 1);
                newLerpRow.push(0);
            }
            grid.push(newGridRow);
            lerpGrid.push(newLerpRow);
        }
    }

    size = newSize;
}

function updateGrid() {
    let newGrid = []
    for (let i = 0; i < size; i++)
        newGrid[i] = grid[i].slice();

    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            let neighbour = 0;
            for (let k = -1; k <= 1; ++k) {
                for (let l = -1; l <= 1; ++l) {
                    if (k == 0 && l == 0) continue;
                    let ni = (i + k + size) % size;
                    let nj = (j + l + size) % size;
                    neighbour += grid[nj][ni];
                }
            }
            if (grid[j][i] == 0) {
                if (neighbour == 3)
                    newGrid[j][i] = 1;
                else
                    newGrid[j][i] = 0;
            } else {
                if (neighbour == 2 || neighbour == 3)
                    newGrid[j][i] = 1;
                else
                    newGrid[j][i] = 0;
            }
        }
    }
    grid = newGrid;
}

function draw() {
    let width = canvas.width;
    let height = canvas.height;
    let m = Math.max(width, height);
    let gap = 3;
    let smooth = 0.2;
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            let w = m / size;
            let h = m / size;
            let x = width / 2 + w * (i - size / 2);
            let y = height / 2 + h * (j - size / 2);
            ctx.beginPath();
            ctx.rect(x + gap, y + gap, w - gap, h - gap)
            let c = lerpGrid[j][i] * smooth + grid[j][i] * (1 - smooth);
            lerpGrid[j][i] = c;
            c = 0x18 * (1-c) + 0x20 * c;
            ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
            ctx.fill();
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let m = Math.max(canvas.width, canvas.height);
    let newSize = Math.min(Math.round(m / 16), 32);
    if (!initialized) {
        size = newSize;
        initGrid();
        initialized = true;
    } else {
        resizeGrid(newSize);
    }
    draw();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let lastX = -1;
let lastY = -1;
function mouseMove(e) {
    let m = Math.max(canvas.width, canvas.height);

    let offsetX = 0;
    let offsetY = 0;

    if (canvas.width > canvas.height) {
        offsetY = (m - canvas.height) / 2;
    } else {
        offsetX = (m - canvas.width) / 2;
    }

    let x = Math.floor((e.clientX - offsetX) * size / m);

    let y = Math.floor((e.clientY - offsetY) * size / m);

    if (x < 0 || y < 0 || x >= size || y >= size) return;
    if (x == lastX && y == lastY) return;

    lastX = x;
    lastY = y;
    grid[y][x] = 1 - grid[y][x];
}

// window.addEventListener("mousemove", mouseMove);

setInterval(updateGrid, 1000 / 8);

function loop() {
    draw();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop)
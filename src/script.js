"use strict";

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

function calculateGridSize(screenWidth, screenHeight, cellSize) {
    const gridWidth = Math.floor(screenWidth / cellSize);
    const gridHeight = Math.floor(screenHeight / cellSize);
    return [gridWidth, gridHeight];
}

function resizeGrid(grid, lerpGrid, newGridWidth, newGridHeight, p) {
    const oldWidth = grid[0]?.length || 0;
    const oldHeight = grid.length;

    const newGrid = Array.from({ length: newGridHeight }, (_, i) =>
        Array.from({ length: newGridWidth }, (_, j) => {
            if (i < oldHeight && j < oldWidth) {
                return grid[i][j];
            }
            return Math.random() < p ? 1 : 0;
        })
    );
    const newLerpGrid = Array.from({ length: newGridHeight }, (_, i) =>
        Array.from({ length: newGridWidth }, (_, j) => {
            if (i < oldHeight && j < oldWidth) {
                return lerpGrid[i][j];
            }
            return 0;
        })
    );

    return [newGrid, newLerpGrid];
}

function updateGrid(grid) {
    const rows = grid.length;
    const cols = grid[0].length;

    const newGrid = Array.from({ length: rows }, () => Array(cols).fill(0));

    const getNeighborCount = (x, y) => {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = (x + i + rows) % rows;
                const ny = (y + j + cols) % cols;
                count += grid[nx][ny];
            }
        }
        return count;
    };

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const neighbors = getNeighborCount(i, j);
            if (grid[i][j] === 1) {
                newGrid[i][j] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
                newGrid[i][j] = neighbors === 3 ? 1 : 0;
            }
        }
    }

    return newGrid;
}

function draw(grid, lerpGrid, cellSize, gap, smooth) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const gridWidth = grid[0].length;
    const gridHeight = grid.length;

    for (let i = 0; i < gridHeight; ++i) {
        for (let j = 0; j < gridWidth; ++j) {
            const x = cellSize * (j - gridHeight / 2) + screenWidth / 2;
            const y = cellSize * (i - gridHeight / 2) + screenHeight / 2;
            let c = lerpGrid[i][j] * smooth + grid[i][j] * (1 - smooth);
            lerpGrid[i][j] = c;
            c = 0x18 * (1 - c) + 0x20 * c;
            ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
            ctx.fillRect(
                x + gap, y + gap,
                cellSize - gap, cellSize - gap
            );
        }
    }
}

function mouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const gridWidth = grid[0].length;
    const gridHeight = grid.length;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const j = Math.floor((mouseX - screenWidth / 2 + gridHeight / 2 * cellSize) / cellSize);
    const i = Math.floor((mouseY - screenHeight / 2 + gridHeight / 2 * cellSize) / cellSize);

    if (i >= 0 && i < gridHeight && j >= 0 && j < gridWidth) {
        grid[i][j] = 1;
    }
}

window.addEventListener("mousemove", mouseMove);

const prob = 0.2;
const cellSize = 40;

let gridSize = calculateGridSize(window.innerWidth, window.innerHeight, cellSize);
let grid = [[]];
let lerpGrid = [[]];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gridSize = calculateGridSize(window.innerWidth, window.innerHeight, cellSize);
    [grid, lerpGrid] = resizeGrid(grid, lerpGrid, gridSize[0], gridSize[1], prob);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

setInterval(function () {
    grid = updateGrid(grid);
}, 150);

function loop() {
    draw(grid, lerpGrid, cellSize, 2, 0.8);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
/* ---- Variable Declarations ---- */

var allRows = 25;
var allCols = 40;
var inProg = false;
var firstMessage = "Click or drag cells to build obstacles! Press 'Start Searching' when you finish and have selected an algorithm!";
var cellsToBuild = [];
var makeWalls = false;
var algo = null;
var justCompleted = false;
var speedOfAnimation = "Fast";
var stateOfAnimation = null;
var firstCell = [11, 15];
var lastCell = [11, 25];
var movingBegin = false;
var movingFinish = false;

function generateGrid( rows, cols ) {
    var grid = "<table>";
    for ( row = 1; row <= rows; row++ ) {
        grid += "<tr>";
        for ( col = 1; col <= cols; col++ ) {      
            grid += "<td></td>";
        }
        grid += "</tr>";
    }
    grid += "</table>"
    return grid;
}

var myGrid = generateGrid( allRows, allCols);
$( "#tableContainer" ).append( myGrid );

/* --------------------------- */
/* --- OBJECT DECLARATIONS --- */
/* --------------------------- */

function Queue() {
 this.stack = new Array();
 this.dequeue = function(){
  return this.stack.pop();
 }
 this.enqueue = function(item){
  this.stack.unshift(item);
  return;
 }
 this.empty = function(){
  return ( this.stack.length == 0 );
 }
 this.clear = function(){
  this.stack = new Array();
  return;
 }
}

function minHeap() {
this.heap = [];
this.isEmpty = function(){
return (this.heap.length == 0);
}
this.clear = function(){
this.heap = [];
return;
}
this.getMin = function(){
if (this.isEmpty()){
return null;
}
var min = this.heap[0];
this.heap[0] = this.heap[this.heap.length - 1];
this.heap[this.heap.length - 1] = min;
this.heap.pop();
if (!this.isEmpty()){
this.siftDown(0);
}
return min;
}
this.push = function(item){
this.heap.push(item);
this.siftUp(this.heap.length - 1);
return;
}
this.parent = function(index){
if (index == 0){
return null;
}
return Math.floor((index - 1) / 2);
}
this.children = function(index){
return [(index * 2) + 1, (index * 2) + 2];
}
this.siftDown = function(index){
var children = this.children(index);
var leftChildValid = (children[0] <= (this.heap.length - 1));
var rightChildValid = (children[1] <= (this.heap.length - 1));
var newIndex = index;
if (leftChildValid && this.heap[newIndex][0] > this.heap[children[0]][0]){
newIndex = children[0];
}
if (rightChildValid && this.heap[newIndex][0] > this.heap[children[1]][0]){
newIndex = children[1];
}
// No sifting down needed
if (newIndex === index){ return; }
var val = this.heap[index];
this.heap[index] = this.heap[newIndex];
this.heap[newIndex] = val;
this.siftDown(newIndex);
return;
}
this.siftUp = function(index){
var parent = this.parent(index);
if (parent !== null && this.heap[index][0] < this.heap[parent][0]){
var val = this.heap[index];
this.heap[index] = this.heap[parent];
this.heap[parent] = val;
this.siftUp(parent);
}
return;
}
}

/* ------------------------- */
/* ---- MOUSE FUNCTIONS ---- */
/* ------------------------- */

$( "td" ).mousedown(function(){
var index = $( "td" ).index( this );
var firstCellIndex = (firstCell[0] * (allCols)) + firstCell[1];
var lastCellIndex = (lastCell[0] * (allCols)) + lastCell[1];
if ( !inProg ){
// Clear board if just finished
if ( justCompleted  && !inProg ){
clearBoard( keepWalls = true );
justCompleted = false;
}
if (index == firstCellIndex){
movingBegin = true;
//console.log("Now moving start!");
} else if (index == lastCellIndex){
movingFinish = true;
//console.log("Now moving end!");
} else {
makeWalls = true;
}
}
});

$( "td" ).mouseup(function(){
makeWalls = false;
movingBegin = false;
movingFinish = false;
});

$( "td" ).mouseenter(function() {
if (!makeWalls && !movingBegin && !movingFinish){ return; }
    var index = $( "td" ).index( this );
    var firstCellIndex = (firstCell[0] * (allCols)) + firstCell[1];
var lastCellIndex = (lastCell[0] * (allCols)) + lastCell[1];
    if (!inProg){
    if (justCompleted){
    clearBoard( keepWalls = true );
    justCompleted = false;
    }
    //console.log("Cell index = " + index);
    if (movingBegin && index != lastCellIndex) {
    moveStartOrEnd(firstCellIndex, index, "start");
    } else if (movingFinish && index != firstCellIndex) {
    moveStartOrEnd(lastCellIndex, index, "end");
    } else if (index != firstCellIndex && index != lastCellIndex) {
    $(this).toggleClass("wall");
    }
    }
});

$( "td" ).click(function() {
    var index = $( "td" ).index( this );
    var firstCellIndex = (firstCell[0] * (allCols)) + firstCell[1];
var lastCellIndex = (lastCell[0] * (allCols)) + lastCell[1];
    if ((inProg == false) && !(index == firstCellIndex) && !(index == lastCellIndex)){
    if ( justCompleted ){
    clearBoard( keepWalls = true );
    justCompleted = false;
    }
    $(this).toggleClass("wall");
    }
});

$( "body" ).mouseup(function(){
makeWalls = false;
movingBegin = false;
movingFinish = false;
});

/* ----------------- */
/* ---- BUTTONS ---- */
/* ----------------- */

$( "#startBtn" ).click(function(){
    if ( algo == null ){ return;}
    if ( inProg ){ update("wait"); return; }
traverseGraph(algo);
});

$( "#clearBtn" ).click(function(){
    if ( inProg ){ update("wait"); return; }
clearBoard(keepWalls = false);
});


/* --------------------- */
/* --- NAV BAR MENUS --- */
/* --------------------- */

$( "#algorithms .dropdown-item").click(function(){
if ( inProg ){ update("wait"); return; }
algo = $(this).text();
updateStartBtnText();
console.log("Algorithm has been changed to: " + algo);
});

$( "#speed .dropdown-item").click(function(){
if ( inProg ){ update("wait"); return; }
speedOfAnimation = $(this).text();
updateSpeedDisplay();
console.log("Speed has been changd to: " + speedOfAnimation);
});

$( "#mazes .dropdown-item").click(function(){
if ( inProg ){ update("wait"); return; }
maze = $(this).text();
if (maze == "Random"){
randomMaze();
} else if (maze == "Recursive Division"){
recursiveDivMaze(null);
} else if (maze == "Recursive Division (Vertical Skew)"){
recursiveDivMaze("VERTICAL");
} else if (maze == "Recursive Division (Horizontal Skew)"){
recursiveDivMaze("HORIZONTAL");
} else if (maze == "Simple Spiral"){
spiralMaze();
}
console.log("Maze has been changd to: " + maze);
});

/* ----------------- */
/* --- FUNCTIONS --- */
/* ----------------- */

function moveStartOrEnd(prevIndex, newIndex, startOrEnd){
var newCellY = newIndex % allCols;
var newCellX = Math.floor((newIndex - newCellY) / allCols);
if (startOrEnd == "start"){
    firstCell = [newCellX, newCellY];
    console.log("Moving start to [" + newCellX + ", " + newCellY + "]")
    } else {
    lastCell = [newCellX, newCellY];
    console.log("Moving end to [" + newCellX + ", " + newCellY + "]")
    }
    clearBoard(keepWalls = true);
    return;
}

function moveEnd(prevIndex, newIndex){
// Erase last end cell
$($("td").find(prevIndex)).removeClass();

var newEnd = $("td").find(newIndex);
$(newEnd).removeClass();
    $(newEnd).addClass("end");

    var newEndX = Math.floor(newIndex / allRows);
var newEndY = Math.floor(newIndex / allCols);
    firstCell = [newStartX, newStartY];
    return;
}

function updateSpeedDisplay(){
if (speedOfAnimation == "Slow"){
$(".speedDisplay").text("Speed: Slow");
} else if (speedOfAnimation == "Normal"){
$(".speedDisplay").text("Speed: Normal");
} else if (speedOfAnimation == "Fast"){
$(".speedDisplay").text("Speed: Fast");
}
return;
}

function updateStartBtnText(){
if (algo == "Depth-First Search (DFS)"){
$("#startBtn").html("Start DFS");
} else if (algo == "Breadth-First Search (BFS)"){
$("#startBtn").html("Start BFS");
} else if (algo == "Dijkstra"){
$("#startBtn").html("Start Dijkstra");
} else if (algo == "A*"){
$("#startBtn").html("Start A*");
} else if (algo == "Greedy Best-First Search"){
$("#startBtn").html("Start Greedy BFS");
} else if (algo == "Jump Point Search"){
$("#startBtn").html("Start JPS");
}
return;
}

// Used to display error messages
function update(message){
$("#resultsIcon").removeClass();
$("#resultsIcon").addClass("fas fa-exclamation");
$('#results').css("background-color", "#ffc107");
$("#length").text("");
if (message == "wait"){
$("#duration").text("Please wait for the algorithm to finish.");
}
}

// Used to display results
function updateResults(duration, pathFound, length){
var firstAnimation = "swashOut";
var secondAnimation = "swashIn";
$("#results").removeClass();
    $("#results").addClass("magictime " + firstAnimation);
    setTimeout(function(){
    $("#resultsIcon").removeClass();
    //$("#results").css("height","80px");
    if (pathFound){
    $('#results').css("background-color", "#77dd77");
    $("#resultsIcon").addClass("fas fa-check");
    } else {
    $('#results').css("background-color", "#ff6961");
    $("#resultsIcon").addClass("fas fa-times");
    }
    $("#duration").text("Duration: " + duration + " ms");
    $("#length").text("Length: " + length);
    $('#results').removeClass(firstAnimation);
    $('#results').addClass(secondAnimation);
    }, 1100);
}

// Counts length of success
function countLength(){
var cells = $("td");
var l = 0;
for (var i = 0; i < cells.length; i++){
if ($(cells[i]).hasClass("success")){
l++;
}
}
return l;
}

async function traverseGraph(algo){
    inProg = true;
clearBoard( keepWalls = true );
var startTime = Date.now();
var pathFound = executeAlgo();
var endTime = Date.now();
await animateCells();
if ( pathFound ){
updateResults((endTime - startTime), true, countLength());
} else {
updateResults((endTime - startTime), false, countLength());
}
inProg = false;
justCompleted = true;
}

function executeAlgo(){
if (algo == "Depth-First Search (DFS)"){
var visited = createVisited();
var pathFound = DFS(firstCell[0], firstCell[1], visited);
} else if (algo == "Breadth-First Search (BFS)"){
var pathFound = BFS();
} else if (algo == "Dijkstra"){
var pathFound = dijkstra();
} else if (algo == "A*"){
var pathFound = AStar();
} else if (algo == "Greedy Best-First Search"){
var pathFound = greedyBestFirstSearch();
} else if (algo == "Jump Point Search"){
var pathFound = jumpPointSearch();
}
return pathFound;
}

function makeWall(cell){
if (!makeWalls){return;}
    var index = $( "td" ).index( cell );
    var row = Math.floor( ( index ) / allRows) + 1;
    var col = ( index % allCols ) + 1;
    console.log([row, col]);
    if ((inProg == false) && !(row == 1 && col == 1) && !(row == allRows && col == allCols)){
    $(cell).toggleClass("wall");
    }
}

function createVisited(){
var visited = [];
var cells = $("#tableContainer").find("td");
for (var i = 0; i < allRows; i++){
var row = [];
for (var j = 0; j < allCols; j++){
if (cellIsAWall(i, j, cells)){
row.push(true);
} else {
row.push(false);
}
}
visited.push(row);
}
return visited;
}

function cellIsAWall(i, j, cells){
var cellNum = (i * (allCols)) + j;
return $(cells[cellNum]).hasClass("wall");
}

// Make it iterable?
function DFS(i, j, visited){
if (i == lastCell[0] && j == lastCell[1]){
cellsToBuild.push( [[i, j], "success"] );
return true;
}
visited[i][j] = true;
cellsToBuild.push( [[i, j], "searching"] );
var neighbors = getNeighbors(i, j);
for(var k = 0; k < neighbors.length; k++){
var m = neighbors[k][0];
var n = neighbors[k][1];
if ( !visited[m][n] ){
var pathFound = DFS(m, n, visited);
if ( pathFound ){
cellsToBuild.push( [[i, j], "success"] );
return true;
}
}
}
cellsToBuild.push( [[i, j], "visited"] );
return false;
}


// NEED TO REFACTOR AND MAKE LESS LONG
function BFS(){
var pathFound = false;
var myQueue = new Queue();
var prev = createPrev();
var visited = createVisited();
myQueue.enqueue( firstCell );
cellsToBuild.push(firstCell, "searching");
visited[ firstCell[0] ][ firstCell[1] ] = true;
while ( !myQueue.empty() ){
var cell = myQueue.dequeue();
var r = cell[0];
var c = cell[1];
cellsToBuild.push( [cell, "visited"] );
if (r == lastCell[0] && c == lastCell[1]){
pathFound = true;
break;
}
// Put neighboring cells in queue
var neighbors = getNeighbors(r, c);
for (var k = 0; k < neighbors.length; k++){
var m = neighbors[k][0];
var n = neighbors[k][1];
if ( visited[m][n] ) { continue ;}
visited[m][n] = true;
prev[m][n] = [r, c];
cellsToBuild.push( [neighbors[k], "searching"] );
myQueue.enqueue(neighbors[k]);
}
}
// Make any nodes still in the queue "visited"
while ( !myQueue.empty() ){
var cell = myQueue.dequeue();
var r = cell[0];
var c = cell[1];
cellsToBuild.push( [cell, "visited"] );
}
// If a path was found, illuminate it
if (pathFound) {
var r = lastCell[0];
var c = lastCell[1];
cellsToBuild.push( [[r, c], "success"] );
while (prev[r][c] != null){
var prevCell = prev[r][c];
r = prevCell[0];
c = prevCell[1];
cellsToBuild.push( [[r, c], "success"] );
}
}
return pathFound;
}

function dijkstra() {
var pathFound = false;
var myHeap = new minHeap();
var prev = createPrev();
var distances = createDistances();
var visited = createVisited();
distances[ firstCell[0] ][ firstCell[1] ] = 0;
myHeap.push([0, [firstCell[0], firstCell[1]]]);
cellsToBuild.push([[firstCell[0], firstCell[1]], "searching"]);
while (!myHeap.isEmpty()){
var cell = myHeap.getMin();
//console.log("Min was just popped from the heap! Heap is now: " + JSON.stringify(myHeap.heap));
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push([[i, j], "visited"]);
if (i == lastCell[0] && j == lastCell[1]){
pathFound = true;
break;
}
var neighbors = getNeighbors(i, j);
for (var k = 0; k < neighbors.length; k++){
var m = neighbors[k][0];
var n = neighbors[k][1];
if (visited[m][n]){ continue; }
var newDistance = distances[i][j] + 1;
if (newDistance < distances[m][n]){
distances[m][n] = newDistance;
prev[m][n] = [i, j];
myHeap.push([newDistance, [m, n]]);
//console.log("New cell was added to the heap! It has distance = " + newDistance + ". Heap = " + JSON.stringify(myHeap.heap));
cellsToBuild.push( [[m, n], "searching"] );
}
}
//console.log("Cell [" + i + ", " + j + "] was just evaluated! myHeap is now: " + JSON.stringify(myHeap.heap));
}
//console.log(JSON.stringify(myHeap.heap));
// Make any nodes still in the heap "visited"
while ( !myHeap.isEmpty() ){
var cell = myHeap.getMin();
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push( [[i, j], "visited"] );
}
// If a path was found, illuminate it
if (pathFound) {
var i = lastCell[0];
var j = lastCell[1];
cellsToBuild.push( [lastCell, "success"] );
while (prev[i][j] != null){
var prevCell = prev[i][j];
i = prevCell[0];
j = prevCell[1];
cellsToBuild.push( [[i, j], "success"] );
}
}
return pathFound;
}

function AStar() {
var pathFound = false;
var myHeap = new minHeap();
var prev = createPrev();
var distances = createDistances();
var costs = createDistances();
var visited = createVisited();
distances[ firstCell[0] ][ firstCell[1] ] = 0;
costs[ firstCell[0] ][ firstCell[1] ] = 0;
myHeap.push([0, [firstCell[0], firstCell[1]]]);
cellsToBuild.push([[firstCell[0], firstCell[1]], "searching"]);
while (!myHeap.isEmpty()){
var cell = myHeap.getMin();
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push([[i, j], "visited"]);
if (i == lastCell[0] && j == lastCell[1]){
pathFound = true;
break;
}
var neighbors = getNeighbors(i, j);
for (var k = 0; k < neighbors.length; k++){
var m = neighbors[k][0];
var n = neighbors[k][1];
if (visited[m][n]){ continue; }
var newDistance = distances[i][j] + 1;
if (newDistance < distances[m][n]){
distances[m][n] = newDistance;
prev[m][n] = [i, j];
cellsToBuild.push( [[m, n], "searching"] );
}
var newCost = distances[i][j] + Math.abs(lastCell[0] - m) + Math.abs(lastCell[1] - n);
if (newCost < costs[m][n]){
costs[m][n] = newCost;
myHeap.push([newCost, [m, n]]);
}
}
}
// Make any nodes still in the heap "visited"
while ( !myHeap.isEmpty() ){
var cell = myHeap.getMin();
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push( [[i, j], "visited"] );
}
// If a path was found, illuminate it
if (pathFound) {
var i = lastCell[0];
var j = lastCell[1];
cellsToBuild.push( [lastCell, "success"] );
while (prev[i][j] != null){
var prevCell = prev[i][j];
i = prevCell[0];
j = prevCell[1];
cellsToBuild.push( [[i, j], "success"] );
}
}
return pathFound;
}

function jumpPointSearch() {
var pathFound = false;
var myHeap = new minHeap();
var prev = createPrev();
var distances = createDistances();
var costs = createDistances();
var visited = createVisited();
var walls = createVisited();
distances[ firstCell[0] ][ firstCell[1] ] = 0;
costs[ firstCell[0] ][ firstCell[1] ] = 0;
myHeap.push([0, [firstCell[0], firstCell[1]]]);
cellsToBuild.push([[firstCell[0], firstCell[1]], "searching"]);
while (!myHeap.isEmpty()){
var cell = myHeap.getMin();
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push([[i, j], "visited"]);
if (i == lastCell[0] && j == lastCell[1]){
pathFound = true;
break;
}
var neighbors = pruneNeighbors(i, j, visited, walls);
for (var k = 0; k < neighbors.length; k++){
var m = neighbors[k][0];
var n = neighbors[k][1];
if (visited[m][n]){ continue; }
var newDistance = distances[i][j] + Math.abs(i - m) + Math.abs(j - n);
if (newDistance < distances[m][n]){
distances[m][n] = newDistance;
prev[m][n] = [i, j];
cellsToBuild.push( [[m, n], "searching"] );
}
var newCost = distances[i][j] + Math.abs(lastCell[0] - m) + Math.abs(lastCell[1] - n);
if (newCost < costs[m][n]){
costs[m][n] = newCost;
myHeap.push([newCost, [m, n]]);
}
}
}
// Make any nodes still in the heap "visited"
while ( !myHeap.isEmpty() ){
var cell = myHeap.getMin();
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push( [[i, j], "visited"] );
}
// If a path was found, illuminate it:
if (pathFound) {
var i = lastCell[0];
var j = lastCell[1];
cellsToBuild.push( [lastCell, "success"] );
while (prev[i][j] != null){
var prevCell = prev[i][j];
x = prevCell[0];
y = prevCell[1];
// Loop through and illuminate each cell in between [i, j] and [x, y]
// Horizontal
if ((i - x) == 0){
// Move right
if (j < y){
for (var k = j; k < y; k++){
cellsToBuild.push( [[i, k], "success"] );
}
// Move left
} else {
for (var k = j; k > y; k--){
cellsToBuild.push( [[i, k], "success"] );
}
}
// Vertical
} else {
// Move down
if (i < x){
for (var k = i; k < x; k++){
cellsToBuild.push( [[k, j], "success"] );
}
// Move up
} else {
for (var k = i; k > x; k--){
cellsToBuild.push( [[k, j], "success"] );
}
}
}
i = prevCell[0];
j = prevCell[1];
cellsToBuild.push( [[i, j], "success"] );
}
}
return pathFound;
}

function pruneNeighbors(i, j, visited, walls){
var neighbors = [];
var stored = {};
// Scan horizontally
for (var num = 0; num < 2; num++){
if (!num){
var direction = "right";
var increment = 1;
} else {
var direction = "left";
var increment = -1;
}
for (var c = j + increment; (c < allCols) && (c >= 0); c += increment){
var xy = i + "-" + c;
if (visited[i][c]){ break; }
//Check if same row or column as end cell
if ((lastCell[0] == i || lastCell[1] == c) && !stored[xy]){
neighbors.push([i, c]);
stored[xy] = true;
continue;
}
// Check if dead end
var deadEnd = !(xy in stored) && ((direction == "left" && (c > 0) && walls[i][c - 1]) || (direction == "right" && c < (allCols - 1) && walls[i][c + 1]) || (c == allCols - 1) || (c == 0));  
if (deadEnd){
neighbors.push([i, c]);
stored[xy] = true;
break;
}
//Check for forced neighbors
var validForcedNeighbor = (direction == "right" && c < (allCols - 1) && (!walls[i][c + 1])) || (direction == "left" && (c > 0) && (!walls[i][c - 1]));
if (validForcedNeighbor){
checkForcedNeighbor(i, c, direction, neighbors, walls, stored);
}
}
}
// Scan vertically
for (var num = 0; num < 2; num++){
if (!num){
var direction = "down";
var increment = 1;
} else {
var direction = "up";
var increment = -1;
}
for (var r = i + increment; (r < allRows) && (r >= 0); r += increment){
var xy = r + "-" + j;
if (visited[r][j]){ break; }
if ((lastCell[0] == r || lastCell[1] == j) && !stored[xy]){
neighbors.push([r, j]);
stored[xy] = true;
continue;
}
// Check if dead end
var deadEnd = !(xy in stored) && ((direction == "up" && (r > 0) && walls[r - 1][j]) || (direction == "down" && r < (allRows - 1) && walls[r + 1][j]) || (r == allRows - 1) || (r == 0));  
if (deadEnd){
neighbors.push([r, j]);
stored[xy] = true;
break;
}
//Check for forced neighbors
var validForcedNeighbor = (direction == "down" && (r < (allRows - 1)) && (!walls[r + 1][j])) || (direction == "up" && (r > 0) && (!walls[r - 1][j]));
if (validForcedNeighbor){
checkForcedNeighbor(r, j, direction, neighbors, walls, stored);
}
}
}
return neighbors;
}

function checkForcedNeighbor(i, j, direction, neighbors, walls, stored){
//console.log(JSON.stringify(walls));
if (direction == "right"){
var isForcedNeighbor = ((i > 0) && walls[i - 1][j] && (!walls[i - 1][j + 1])) || ((i < (allRows - 1)) &&  walls[i + 1][j] && (!walls[i + 1][j + 1]));
var neighbor = [i, j + 1];
} else if (direction == "left"){
var isForcedNeighbor = ((i > 0) && walls[i - 1][j] && !walls[i - 1][j - 1]) || ((i < (allRows - 1)) && walls[i + 1][j] && !walls[i + 1][j - 1]);
var neighbor = [i, j - 1];
} else if (direction == "up"){
var isForcedNeighbor = ((j < (allCols - 1)) && walls[i][j + 1] && !walls[i - 1][j + 1]) || ((j > 0) && walls[i][j - 1] && !walls[i - 1][j - 1]);
var neighbor = [i - 1, j];
} else {
var isForcedNeighbor = ((j < (allCols - 1)) && walls[i][j + 1] && !walls[i + 1][j + 1]) || ((j > 0) && walls[i][j - 1] && !walls[i + 1][j - 1]);
var neighbor = [i + 1, j];
}
var xy = neighbor[0] + "-" + neighbor[1];
if (isForcedNeighbor && !stored[xy]){
//console.log("Neighbor " + JSON.stringify(neighbor) + " is forced! Adding to neighbors and stored.")
neighbors.push(neighbor);
stored[xy] = true;
} else {
//console.log("Is not a forced neighbor..");
}
//return;
}

function greedyBestFirstSearch() {
var pathFound = false;
var myHeap = new minHeap();
var prev = createPrev();
var costs = createDistances();
var visited = createVisited();
costs[ firstCell[0] ][ firstCell[1] ] = 0;
myHeap.push([0, [firstCell[0], firstCell[1]]]);
cellsToBuild.push([[firstCell[0], firstCell[1]], "searching"]);
while (!myHeap.isEmpty()){
var cell = myHeap.getMin();
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push([[i, j], "visited"]);
if (i == lastCell[0] && j == lastCell[1]){
pathFound = true;
break;
}
var neighbors = getNeighbors(i, j);
for (var k = 0; k < neighbors.length; k++){
var m = neighbors[k][0];
var n = neighbors[k][1];
if (visited[m][n]){ continue; }
var newCost = Math.abs(lastCell[0] - m) + Math.abs(lastCell[1] - n);
if (newCost < costs[m][n]){
prev[m][n] = [i, j];
costs[m][n] = newCost;
myHeap.push([newCost, [m, n]]);
cellsToBuild.push([[m, n], "searching"]);
}
}
}
// Make any nodes still in the heap "visited"
while ( !myHeap.isEmpty() ){
var cell = myHeap.getMin();
var i = cell[1][0];
var j = cell[1][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cellsToBuild.push( [[i, j], "visited"] );
}
// If a path was found, illuminate it
if (pathFound) {
var i = lastCell[0];
var j = lastCell[1];
cellsToBuild.push( [lastCell, "success"] );
while (prev[i][j] != null){
var prevCell = prev[i][j];
i = prevCell[0];
j = prevCell[1];
cellsToBuild.push( [[i, j], "success"] );
}
}
return pathFound;
}

async function randomMaze(){
inProg = true;
clearBoard(keepWalls = false);
var visited = createVisited();
var walls = makeWalls();
var cells = [ firstCell, lastCell ];
walls [ firstCell[0] ][ firstCell[1] ] = false;
walls [ lastCell[0] ][ lastCell[1] ] = false;
visited[ firstCell[0] ][ firstCell[1] ] = true;
visited[ lastCell[0] ][ lastCell[1] ] = true;
while ( cells.length > 0 ){
var random = Math.floor(Math.random() * cells.length);
var randomCell = cells[random];
cells[random] = cells[cells.length - 1];
cells.pop();
var neighbors = getNeighbors(randomCell[0], randomCell[1]);
if (neighborsThatAreWalls(neighbors, walls) < 2){ continue; }
walls[ randomCell[0] ][ randomCell[1] ] = false;
for (var k = 0; k < neighbors.length; k++){
var i = neighbors[k][0];
var j = neighbors[k][1];
if (visited[i][j]){ continue; }
visited[i][j] = true;
cells.push([i, j]);
}
}
//Animate cells
var cells = $("#tableContainer").find("td");
for (var i = 0; i < allRows; i++){
for (var j = 0; j < allCols; j++){
if (i == 0 || i == (allRows - 1) || j == 0 || j == (allCols - 1) || walls[i][j]){
cellsToBuild.push([ [i, j], "wall"]);
}
}
}
await animateCells();
inProg = false;
return;
}

async function spiralMaze(){
inProg = true;
clearBoard(keepWalls = false);

var length = 1;
var direction = {
"0": [-1, 1],  //northeast
"1": [1, 1],   //southeast
"2": [1, -1],  //southwest
"3": [-1, -1], //northwest
};
var cell = [Math.floor(allRows / 2), Math.floor(allCols / 2)];
while (inBounds(cell)){
var i_increment = direction[length % 4][0];
var j_increment = direction[length % 4][1];
for (var count = 0; count < length; count++){
var i = cell[0];
var j = cell[1];
cellsToBuild.push( [[i, j], "wall"] );
cell[0] += i_increment;
cell[1] += j_increment;
if (!inBounds(cell)){ break; }
}
length += 1;
}
await animateCells();
inProg = false;
return;
}

function inBounds(cell){
return (cell[0] >= 0 && cell[1] >= 0 && cell[0] < allRows && cell[1] < allCols);
}

async function recursiveDivMaze(bias){
inProg = true;
clearBoard(keepWalls = false);

//Animate edge walls
for (var i = 0; i < allRows; i++){
for (var j = 0; j < allCols; j++){
if (i == 0 || j == 0 || i == (allRows - 1) || j == (allCols - 1)){
cellsToBuild.push([ [i, j], "wall"]);
}
}
}

var walls = createVisited();
var passages = createVisited();
recursiveDivMazeHelper(1, (allRows - 2), 1, (allCols - 2), 2, (allRows - 3), 2, (allCols - 3), walls, passages, bias);
await animateCells();
inProg = false;
return;
}

function recursiveDivMazeHelper(iStart, iEnd, jStart, jEnd, horzStart, horzEnd, vertStart, vertEnd, walls, passages, bias){
var height = iEnd - iStart + 1;
var width = jEnd - jStart + 1;
var canMakeVertWall = (vertEnd - vertStart) >= 0;
var canMakeHorzWall = (horzEnd - horzStart) >= 0;
  if (height < 3 || width < 3 || !canMakeVertWall | !canMakeHorzWall) {
return;
}
// Choose line orientation
var x = Math.floor(Math.random() * 10);
if (bias == "VERTICAL"){
var lineOrientation = x < 8 ? "VERTICAL" : "HORIZONTAL"; // weighting: 90/10 (V/H)
} else if (bias == "HORIZONTAL"){
var lineOrientation = x < 1 ? "VERTICAL" : "HORIZONTAL"; // weighting: 10/90 (V/H)
} else {
var lineOrientation = x < 5 ? "VERTICAL" : "HORIZONTAL"; // weighting: 50/50 (V/H)
}

// Draw line and create random passage
if (lineOrientation == "VERTICAL"){
var vertWidth = vertEnd - vertStart + 1;
var randCol = Math.floor(Math.random() * vertWidth) + vertStart;
if (passages[iStart][randCol]){
var randRow = iStart;
} else if (passages[iEnd][randCol]){
var randRow = iEnd;
} else {
var randRow = (Math.floor(Math.random() * 2) == 0) ? iStart: iEnd; // random end assignment
//var randRow = Math.floor(Math.random() * height) + iStart; // random parition
}
for (var i = iStart; i <= iEnd; i++){
if ( passages[i][randCol] ){ continue; }
if (i == randRow){
// Make passages
for (var j = randCol - 1; j <= randCol + 1; j++){
passages[i][j] = true;
}
} else {
walls[i][randCol] = true;
cellsToBuild.push([ [i, randCol], "wall"]);
}
}
recursiveDivMazeHelper(iStart, iEnd, jStart, (randCol - 1), horzStart, horzEnd, vertStart, (randCol - 2), walls, passages); //left
recursiveDivMazeHelper(iStart, iEnd, (randCol + 1), jEnd, horzStart, horzEnd, (randCol + 2), vertEnd, walls, passages); //right
} else {
var horzHeight = horzEnd - horzStart + 1;
var randRow = Math.floor(Math.random() * horzHeight) + horzStart;
if (passages[randRow][jStart]){
var randCol = jStart;
} else if (passages[randRow][jEnd]){
var randCol = jEnd;
} else {
var randCol = (Math.floor(Math.random() * 2) == 0) ? jStart: jEnd; // random end assignment
//var randCol = Math.floor(Math.random() * width) + jStart; // random parition
}
for (var j = jStart; j <= jEnd; j++){
if ( passages[randRow][j] ){ continue; }
if (j == randCol){
// Make passages
for (var i = randRow - 1; i <= randRow + 1; i++){
passages[i][j] = true;
}
} else {
walls[randRow][j] = true;
cellsToBuild.push([ [randRow, j], "wall"]);
}
}
recursiveDivMazeHelper(iStart, (randRow - 1), jStart, jEnd, horzStart, (randRow - 2), vertStart, vertEnd, walls, passages); //up
recursiveDivMazeHelper((randRow + 1), iEnd, jStart, jEnd, (randRow + 2), horzEnd, vertStart, vertEnd, walls, passages); //down
}
return;
}


function makeWalls(){
var walls = [];
for (var i = 0; i < allRows; i++){
var row = [];
for (var j = 0; j < allCols; j++){
row.push(true);
}
walls.push(row);
}
return walls;
}

function neighborsThatAreWalls( neighbors, walls ){
var neighboringWalls = 0;
for (var k = 0; k < neighbors.length; k++){
var i = neighbors[k][0];
var j = neighbors[k][1];
if (walls[i][j]) { neighboringWalls++; }
}
return neighboringWalls;
}

function createDistances(){
var distances = [];
for (var i = 0; i < allRows; i++){
var row = [];
for (var j = 0; j < allCols; j++){
row.push(Number.POSITIVE_INFINITY);
}
distances.push(row);
}
return distances;
}

function createPrev(){
var prev = [];
for (var i = 0; i < allRows; i++){
var row = [];
for (var j = 0; j < allCols; j++){
row.push(null);
}
prev.push(row);
}
return prev;
}

function getNeighbors(i, j){
var neighbors = [];
if ( i > 0 ){ neighbors.push( [i - 1, j] );}
if ( j > 0 ){ neighbors.push( [i, j - 1] );}
if ( i < (allRows - 1) ){ neighbors.push( [i + 1, j] );}
if ( j < (allCols - 1) ){ neighbors.push( [i, j + 1] );}
return neighbors;
}

async function animateCells(){
stateOfAnimation = null;
var cells = $("#tableContainer").find("td");
var firstCellIndex = (firstCell[0] * (allCols)) + firstCell[1];
var lastCellIndex = (lastCell[0] * (allCols)) + lastCell[1];
var delay = getDelay();
for (var i = 0; i < cellsToBuild.length; i++){
var cellCoordinates = cellsToBuild[i][0];
var x = cellCoordinates[0];
var y = cellCoordinates[1];
var num = (x * (allCols)) + y;
if (num == firstCellIndex || num == lastCellIndex){ continue; }
var cell = cells[num];
var colorClass = cellsToBuild[i][1];

// Wait until its time to animate
await new Promise(resolve => setTimeout(resolve, delay));

$(cell).removeClass();
$(cell).addClass(colorClass);
}
cellsToBuild = [];
//console.log("End of animation has been reached!");
return new Promise(resolve => resolve(true));
}
/*
async function flash(color){
var item = "#logo";
var originalColor = $(item).css("color");
if (color == "green"){
var colorRGB = '40,167,50';
} else if (color == "red"){
var colorRGB = '255,0,0';
}
var delay = 1; //ms
for (var i = 0.45; i <= 2.6; i += 0.01){
    $(item).css("color", 'rgba(' + colorRGB + ','+Math.abs(Math.sin(i))+')');
await new Promise(resolve => setTimeout(resolve, delay));
}
$(item).css("color", originalColor);
return new Promise(resolve => resolve(true));
}
*/

function getDelay(){
var delay;
if (speedOfAnimation === "Slow"){
if (algo == "Depth-First Search (DFS)") {
delay = 25;
} else {
delay = 20;
}
} else if (speedOfAnimation === "Normal") {
if (algo == "Depth-First Search (DFS)") {
delay = 15;
} else {
delay = 10;
}
} else if (speedOfAnimation == "Fast") {
if (algo == "Depth-First Search (DFS)") {
delay = 10;
} else {
delay = 5;
}
}
console.log("Delay = " + delay);
return delay;
}

function clearBoard( keepWalls ){
var cells = $("#tableContainer").find("td");
var firstCellIndex = (firstCell[0] * (allCols)) + firstCell[1];
var lastCellIndex = (lastCell[0] * (allCols)) + lastCell[1];
for (var i = 0; i < cells.length; i++){
isWall = $( cells[i] ).hasClass("wall");
$( cells[i] ).removeClass();
if (i == firstCellIndex){
$(cells[i]).addClass("start");
} else if (i == lastCellIndex){
$(cells[i]).addClass("end");
} else if ( keepWalls && isWall ){
$(cells[i]).addClass("wall");
}
}
}

// Ending statements
clearBoard();

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus');
})

$(window).on('load',function(){
        $('#exampleModalLong').modal('show');
});
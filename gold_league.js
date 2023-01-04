const ME = 1;
const OPP = 0;
const NONE = -1;

const LEFT = 0;
const RIGHT = 1;

var inputs = readline().split(" ");
const width = parseInt(inputs[0]);
const height = parseInt(inputs[1]);
let turn = 0;
const endOfEarlyGame = 6;

// game loop
while (true) {
  const tiles = [];
  const myUnits = [];
  const oppUnits = [];
  const myRecyclers = [];
  const oppRecyclers = [];
  const oppTiles = [];
  const myTiles = [];
  const neutralTiles = [];

  var inputs = readline().split(" ");
  let myMatter = parseInt(inputs[0]);
  const oppMatter = parseInt(inputs[1]);
  const map = new Array(height);
  for (let y = 0; y < height; y++) {
    map[y] = [];
    for (let x = 0; x < width; x++) {
      var inputs = readline().split(" ");
      const scrapAmount = parseInt(inputs[0]);
      const owner = parseInt(inputs[1]); // 1 = me, 0 = foe, -1 = neutral
      const units = parseInt(inputs[2]);
      const recycler = inputs[3] == "1";
      const canBuild = inputs[4] == "1";
      const canSpawn = inputs[5] == "1";
      const inRangeOfRecycler = inputs[6] == "1";
      const visited = false;
      const tile = {
        x,
        y,
        scrapAmount,
        owner,
        units,
        recycler,
        canBuild,
        canSpawn,
        inRangeOfRecycler,
        visited,
      };
      if (tile.units > 0 && tile.owner == ME){
        let should_go = -1;
        should_go = tile.x < Math.floor(width/2) ? RIGHT : LEFT;//handle direction if the units are in the middle
        console.error(should_go == RIGHT ? "GO RIGHT" : "GO LEFT");
      }
      tiles.push(tile);
      map[y].push(tile);

      if (tile.owner == ME) {
        myTiles.push(tile);
        if (tile.units > 0) {
          myUnits.push(tile);
        } else if (tile.recycler) {
          myRecyclers.push(tile);
        }
      } else if (tile.owner == OPP) {
        oppTiles.push(tile);
        if (tile.units > 0) {
          oppUnits.push(tile);
        } else if (tile.recycler) {
          oppRecyclers.push(tile);
        }
      } else {
        neutralTiles.push(tile);
      }
    }
  }

  const actions = [];
  


  for (var tile of myTiles){
    // if (tile.units == 0 && tile.canSpawn && myMatter >= 10 && !tile.recycler && nearEnemyTiles(tile, map, height, width)){
    //   actions.push(`SPAWN 1 ${tile.x} ${tile.y}`);
    //   myMatter -= 10;
    // }
    if (tile.units == 0 && tile.canBuild && myMatter >= 10  && near_enemy(tile, oppTiles)){
        actions.push(`BUILD ${tile.x} ${tile.y}`);
        myMatter -= 10;
    }
  }
  
  if (turn < endOfEarlyGame && myMatter >= 10) {
    const recyclerTiles = myTiles.map((tile) => {
      tile.recyclerScore = 0;
      if (tile.canBuild) {
        let totalScrap = 0;
        const maxRecycler = tile.scrapAmount;
        totalScrap += maxRecycler;
        if (tile.y > 0) {
          totalScrap += Math.min(
            map[tile.y - 1][tile.x].scrapAmount,
            maxRecycler
          );
          if (map[tile.y - 1][tile.x].recycler) {
            totalScrap -= 100;
          }
        }
        if (tile.y < map.length - 1) {
          totalScrap += Math.min(
            map[tile.y + 1][tile.x].scrapAmount,
            maxRecycler
          );
          if (map[tile.y + 1][tile.x].recycler) {
            totalScrap -= 100;
          }
        }
        if (tile.x > 0) {
          totalScrap += Math.min(
            map[tile.y][tile.x - 1].scrapAmount,
            maxRecycler
          );
          if (map[tile.y][tile.x - 1].recycler) {
            totalScrap -= 100;
          }
        }
        if (tile.x < map[tile.y].length - 1) {
          totalScrap += Math.min(
            map[tile.y][tile.x + 1].scrapAmount,
            maxRecycler
          );
          if (map[tile.y][tile.x + 1].recycler) {
            totalScrap -= 100;
          }
        }
        tile.recyclerScore = totalScrap;
      }
      return tile;
    });
    recyclerTiles.sort((a, b) => b.recyclerScore - a.recyclerScore);
    console.error(`width: ${width}`);
    if (recyclerTiles[0].recyclerScore >= 1 && near_center(recyclerTiles[0], width)) {
      myMatter -= 10;
      actions.push(`BUILD ${recyclerTiles[0].x} ${recyclerTiles[0].y}`);
    }
  }

  const targetTiles = [
    ...oppTiles.filter((tile) => !tile.recycler),
    ...neutralTiles.filter((tile) => tile.scrapAmount > 0),
  ];
  const canSpawnTiles = myTiles.filter((tile) => tile.canSpawn);

  canSpawnTiles.map((tile) => {
    const distances = oppUnits.map((target) => distance(tile, target));
    tile.spawnScore = distances.reduce((a, b) => a + b, 0) / distances.length;
    return tile;
  });
  canSpawnTiles.sort((a, b) => a.spawnScore - b.spawnScore);

  var target = canSpawnTiles.shift();
  if (target && myMatter >= 10) {
    actions.push(`SPAWN ${1} ${target.x} ${target.y}`);
    myMatter -= 10;
  }
  while (turn >= endOfEarlyGame && canSpawnTiles.length > 0 && myMatter >= 10) {
    target = canSpawnTiles.shift();
    actions.push(`SPAWN ${1} ${target.x} ${target.y}`);
    myMatter -= 10;
  }

  function distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  
  function near_center(tile, width)
  {
    var istrue = tile.x == width / 2 || tile.x == (width / 2) - 1  || tile.x == (width / 2) + 1;
    console.error(` istrue  ${istrue}`);
    console.error(`tile coordinates: ${tile.x}, center: ${width / 2}`);
    return (istrue);
  }

  function getDirection(unit, oppTiles) {
    var tx = 0;
    for (const t of oppTiles) { 
      tx += t.x;
  }
  tx = tx / oppTiles.length;
  if (unit.x < tx) {
    return RIGHT;
  }
  return LEFT;
}

  function nearEnemyTiles(tile, map, height, width){
    var x = tile.x, y = tile.y;  
    if ((x < width - 1 && map[y][x + 1].owner == OPP && map[y][x + 1].units == 0) 
    || (x > 0 && map[y][x - 1].owner == OPP && map[y][x - 1].units == 0)
    || (y > 0 && map[y - 1][x ].owner == OPP && map[y - 1][x].units == 0)
    || (y <  height - 1  && map[y + 1][x ].owner == OPP && map[y + 1][x].units == 0)){
      return true;
    }
    return false;
  }
  
  function near_enemy(tile, oppTiles)
  {
    var istrue = false;
    oppTiles.map((oppTile) => {
      if (distance(tile, oppTile) == 1 && oppTile.units > 0)
        istrue = true;
    });
    return (istrue);
  }

  function displayMap(map, height, width){
    for (var y = 0; y < height; y++){
      var line = "";
      for (var x = 0; x < width; x++){
        line += map[y][x].owner == ME ? "M" : map[y][x].owner == OPP ? "O" : "N";
        line += map[y][x].visited ? "#" : ".";
        line += " ";
      }
      console.error(line);
    }
  }
  function bfs(tile, map, height, width, oppTiles, flag, count) {
    var queue = [];
    const direction = getDirection(tile, oppTiles);
    console.error(direction == LEFT ? "LEFT" : "RIGHT");
    queue.push(tile);
    tile.visited = true;
    while (queue.length > 0){
      var current = queue.shift();
      if (flag == false && (current.owner != ME && current.units == 0)){
        return (current);
      }
      if (flag == true && (current.owner != ME && current.units == 0 )){
        if (direction == LEFT){
          if (current.x <= tile.x)
            displayMap(map, height, width);
            return (current);
          }
          else{
            if (current.x >= tile.x){
                displayMap(map, height, width);
                return (current);
            }
        }
      }
      var x = current.x, y = current.y;
      if (x > 0 && !map[y][x - 1].visited && (map[y][x - 1].owner != OPP || (map[y][x - 1].owner == OPP && map[y][x - 1].units < tile.units - 1)) && !map[y][x - 1].recycler && map[y][x - 1].scrapAmount > 0){
        map[y][x - 1].visited = true;
        queue.push(map[y][x - 1]);
      }
      if (x < width - 1 && !map[y][x + 1].visited && (map[y][x + 1].owner != OPP || (map[y][x + 1].owner == OPP && map[y][x + 1].units < tile.units - 1)) && !map[y][x + 1].recycler && map[y][x + 1].scrapAmount > 0){
        map[y][x + 1].visited = true;
        queue.push(map[y][x + 1]);
      }
      if (y > 0 && !map[y - 1][x].visited && (map[y - 1][x].owner != OPP || (map[y - 1][x].owner == OPP && map[y - 1][x].units < tile.units - 1)) && !map[y - 1][x].recycler && map[y - 1][x].scrapAmount > 0){
        map[y - 1][x].visited = true;
        queue.push(map[y - 1][x]);
      }
      if (y < height - 1 && !map[y + 1][x].visited && (map[y + 1][x].owner != OPP || (map[y + 1][x].owner == OPP && map[y + 1][x].units < tile.units - 1)) && !map[y + 1][x].recycler && map[y + 1][x].scrapAmount > 0){ 
        map[y + 1][x].visited = true;
        queue.push(map[y + 1][x]);
      }
    }
    return (null);
  }
  for (const tile of myUnits) {
    tile.visited = false;
    map[tile.y][tile.x] = false;
    var flag = true;
    console.error(`unit: ${tile.x} ${tile.y}   ${tile.visited}`);
    // var direction = getDirection(tile, oppTiles);
    // console.error(direction == LEFT ? "DIRECRION LEFT" : "DIRECTION RIGHT");
    targetTiles.sort((a, b) => distance(tile, a) - distance(tile, b));
    target = null;
    target = bfs(tile, map, height, width, oppTiles, flag);
    if (target == null){
        console.error(`tile  {${tile.x} ${tile.y}} bfs not found`);
        target = targetTiles.shift();
    }

    if (target) {
      console.error(`bfs found for ${tile.x} ${tile.y}   {${target.x}, ${target.y}}`);
      const amount = tile.units > 1 ? tile.units - 1 : 1;
      actions.push(
        `MOVE ${amount} ${tile.x} ${tile.y} ${target.x} ${target.y}`
      );
    }
  }

  console.log(actions.length > 0 ? actions.join(";") : "WAIT");
  turn++;
}

//still need some obtimizations
//check why some units are going back instead of attacking the opponent
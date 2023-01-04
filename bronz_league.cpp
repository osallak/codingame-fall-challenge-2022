

#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <time.h>
#include <vector>
#include <cmath>

using namespace std;

static constexpr int ME = 1;
static constexpr int OPP = 0;
static constexpr int NONE = -1;

struct Tile {
  int x, y, scrap_amount, owner, units;
  bool recycler, can_build, can_spawn, in_range_of_recycler;
  ostream &dump(ostream &ioOut) const {
    ioOut << x << " " << y;
    return ioOut;
  }
};
ostream &operator<<(ostream &ioOut, const Tile &obj) { return obj.dump(ioOut); }

void display(vector<string> &actions) {
  if (actions.empty()) {
    cout << "WAIT" << endl;
  } else {
    for (vector<string>::iterator it = actions.begin(); it != actions.end();
         ++it) {
      cout << *it << ";";
    }
    cout << endl;
  }
}

double distance(Tile a, Tile b) {
  return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

Tile closest(Tile a, vector<Tile> b) {
  Tile closest = b[0];
  for (Tile tile : b) {
    if (distance(a, tile) < distance(a, closest))
      closest = tile;
  }
  return closest;
}

class Action
{
  vector<string> &actions;
  public:

        Action(vector<string> &actions): actions(actions)
        {

        }
        void build(const Tile &tile)
        {
            ostringstream action;
            action << "BUILD " << tile;
            actions.emplace_back(action.str());
        }

        void move(Tile &tile, Tile &target, int amount)
        {
          ostringstream action;
          action << "MOVE " << amount << " " << tile << " " << target;
          actions.emplace_back( action.str());
        }

        void spawn(const Tile &tile, int amount)
        {
          ostringstream action;
          action << "SPAWN " << amount << " " << tile;
          actions.emplace_back(action.str());
        }
};


void bfs(Tile unit, vector<Tile> &not_my_tiles, Action &Act, int &my_matter)
{
    for (Tile tile : not_my_tiles)
    {
        if (distance(unit, tile) <= 1 && my_matter >= 10 && !tile.in_range_of_recycler)
        {
          Act.move(unit, tile, unit.units > 1 ? unit.units - 1 : 1);
          not_my_tiles.erase(remove(not_my_tiles.begin(), not_my_tiles.end(), tile), not_my_tiles.end());
          my_matter -= 10;
          break ;
        }
    }
}
int main() {
  srand(time(NULL));
  int width;
  int height;
  cin >> width >> height;
  cin.ignore();

  // game loop
  while (1) {
    vector<Tile> tiles;
    vector<Tile> my_tiles;
    vector<Tile> opp_tiles;
    vector<Tile> neutral_tiles;
    vector<Tile> my_units;
    vector<Tile> opp_units;
    vector<Tile> my_recyclers;
    vector<Tile> opp_recyclers;

    tiles.reserve(width * height);

    int my_matter;
    int opp_matter;
    cin >> my_matter >> opp_matter;
    cin.ignore();
    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        int scrap_amount;
        int owner; // 1 = me, 0 = foe, -1 = neutral
        int units;
        int recycler;
        int can_build;
        int can_spawn;
        int in_range_of_recycler;
        cin >> scrap_amount >> owner >> units >> recycler >> can_build >>
            can_spawn >> in_range_of_recycler;
        cin.ignore();

        Tile tile = {x,
                     y,
                     scrap_amount,
                     owner,
                     units,
                     recycler == 1,
                     can_build == 1,
                     can_spawn == 1,
                     in_range_of_recycler == 1};
        tiles.emplace_back(tile);

        if (tile.owner == ME) {
          my_tiles.emplace_back(tile);
          if (tile.units > 0) {
            my_units.emplace_back(tile);
          } else if (tile.recycler) {
            my_recyclers.emplace_back(tile);
          }
        } else if (tile.owner == OPP) {
          opp_tiles.emplace_back(tile);
          if (tile.units > 0) {
            opp_units.emplace_back(tile);
          } else if (tile.recycler) {
            opp_recyclers.emplace_back(tile);
          }
        } else {
          neutral_tiles.emplace_back(tile);
        }
      }
    }

    vector<string> actions;
    Action Act(actions);

    for (vector<Tile>::iterator it = my_tiles.begin(); it != my_tiles.end();
         ++it) {
      Tile tile = *it;
      if (tile.can_spawn) {
        int amount = 1; // TODO: pick amount of robots to spawn here
        if (amount > 0) {
//spawn methode here
        }
      }
      if (tile.can_build && my_matter >= 10 &&
          (my_tiles.end() - 1)->x == height / 2) {
        for (Tile tile : my_tiles) {
          if (my_matter < 10)
            break;
          if (tile.x == height / 2) {
              Act.build(tile);
          }
        }
      }
    }

    // move

    // for (Tile tile : my_units) {
    //   if (my_matter >= 10) {
    //     bool opp;
    //     int index;
    //     int amount = 1; // TODO: pick amount of units to move
    //     if (neutral_tiles.size() < opp_tiles.size()) {
    //       index = random() % opp_tiles.size();
    //       opp = true;
    //     } else {
    //       index = random() % neutral_tiles.size();
    //       opp = false;
    //     }
    //     Tile target;
    //     if (opp == false)
    //       target = neutral_tiles[index]; // TODO: pick a destination
    //     else
    //       target = opp_tiles[index];

    //     if (opp)
    //       opp_tiles.erase(opp_tiles.begin() + index);
    //     else
    //       neutral_tiles.erase(neutral_tiles.begin() + index);
        
    //   }
    // }

  for (Tile unit : my_units){
    bfs(unit, neutral_tiles, Act, my_matter);
  }
    display(actions);
  }
}
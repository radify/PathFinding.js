import Heap from 'heap';
import Point from "geometry/Point";
import { backtrace } from '../core/Util';
import Heuristic from '../core/Heuristic';
import DiagonalMovement from '../core/DiagonalMovement';

/**
 * A* path-finder.
 * based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed. Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {integer} opt.weight Weight to apply to the heuristic to allow for suboptimal paths, 
 *     in order to speed up the search.
 */
class AStarFinder {

  constructor(opt) {
    opt = opt || {};

    Object.assign(this, {
      _heuristic: opt.heuristic,
      allowDiagonal: opt.allowDiagonal,
      dontCrossCorners: opt.dontCrossCorners,
      diagonalMovement: opt.diagonalMovement || this._defaultDiag(),
      weight: opt.weight || 1,
      step: opt.step || 10
    });

    // When diagonal movement is allowed the manhattan heuristic is not admissible
    // It should be octile instead
    var hDefault = this.diagonalMovement === DiagonalMovement.Never ? Heuristic.manhattan : Heuristic.octile;
    this.heuristic = opt.heuristic || hDefault;
  }

  _defaultDiag() {
    if (!this.allowDiagonal) {
      return DiagonalMovement.Never;
    }
    return this.dontCrossCorners ? DiagonalMovement.OnlyWhenNoObstacles : DiagonalMovement.IfAtMostOneObstacle;
  }

  heuristic(dx, dy) {
    return (this._heuristic || Heuristic.manhattan)(dx, dy);
  }

  /**
   * Find and return the the path.
   * @return {Array.<[number, number]>} The path, including both start and
   *     end positions.
   */
  findPath(start: Point, end: Point, obstacles, opts: Object): Array<Point> {
    var f = {}, g = {}, h = {}, closed = {}, opened = {}, parents = {};

    var openList = new Heap((a, b) => f[a] - f[b]),
        heuristic = this.heuristic,
        diagonalMovement = this.diagonalMovement,
        weight = this.weight,
        abs = Math.abs, SQRT2 = Math.SQRT2,
        node, neighbors, neighbor, x, y, ng, iterations = 0;

    var distance = (point) => heuristic(abs(point.x - end.x), abs(point.y - end.y));

    // set the `g` and `f` value of the start node to be 0
    f[start] = 0;
    g[start] = 0;

    // push the start node into the open list
    openList.push(start);
    opened[start] = true;

    // while the open list is not empty
    while (!openList.empty()) {
      iterations++;
      if (iterations > 100) return backtrace(node, parents);

      // pop the position of node which has the minimum `f` value.
      node = openList.pop();
      closed[node] = true;

      // if reached the end position, construct the path and return it
      if (node.toString() === end.toString()) {
        return backtrace(end, parents);
      }

      // get neigbours of the current node
      neighbors = obstacles.step(node, this.step); // diagonalMovement

      for (var i = 0, l = neighbors.length; i < l; ++i) {
        neighbor = neighbors[i];

        if (closed[neighbor]) {
          continue;
        }

        // get the distance between current node and the neighbor
        // and calculate the next g score
        ng = g[node] + ((neighbor.x - node.x === 0 || neighbor.y - node.y === 0) ? 1 : SQRT2);

        // if node distance to end < neighbor distance, try direct line of sight
        if (distance(node) < distance(neighbor) && obstacles.traverse(node, end)) {
          parents[end] = node.toString();
          return backtrace(end, parents);
        }

        // check if the neighbor has not been inspected yet, or
        // can be reached with smaller cost from the current node
        if (!opened[neighbor] || ng < g[neighbor]) {
          g[neighbor] = ng;
          h[neighbor] = h[neighbor] || weight * distance(neighbor);
          f[neighbor] = g[neighbor] + h[neighbor];
          parents[neighbor] = node.toString();

          if (opened[neighbor]) {
            // the neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            openList.updateItem(neighbor);
          }
          openList.push(neighbor);
          opened[neighbor] = true;
        }
      } // end for each neighbor
    } // end while not open list empty

    // fail to find the path
    return [];
  }
}

export default AStarFinder;
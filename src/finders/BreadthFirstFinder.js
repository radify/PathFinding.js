import { backtrace } from '../core/Util';
import DiagonalMovement from '../core/DiagonalMovement';

/**
 * Breadth-First-Search path finder.
 * @constructor
 * @param {object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed. Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
export default class BreadthFirstFinder {
  constructor(opt) {
    opt = opt || {};

    Object.assign(this, {
      allowDiagonal: opt.allowDiagonal,
      dontCrossCorners: opt.dontCrossCorners,
      diagonalMovement: opt.diagonalMovement
    });

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
          this.diagonalMovement = DiagonalMovement.Never;
        } else {
        if (this.dontCrossCorners) {
          this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
        } else {
          this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
        }
      }
    }
  }

  /**
   * Find and return the the path.
   * @return {Array.<[number, number]>} The path, including both start and
   *     end positions.
   */
  findPath(start, end, grid) {
    var openList = [],
        diagonalMovement = this.diagonalMovement,
        startNode = grid.getNodeAt(start),
        endNode = grid.getNodeAt(end),
        neighbors, neighbor, node, i, l;

    // push the start pos into the queue
    openList.push(startNode);
    startNode.opened = true;

    // while the queue is not empty
    while (openList.length) {
      // take the front node from the queue
      node = openList.shift();
      node.closed = true;

      // reached the end position
      if (node === endNode) return backtrace(endNode);

      neighbors = grid.getNeighbors(node, diagonalMovement);

      for (i = 0, l = neighbors.length; i < l; ++i) {
        neighbor = neighbors[i];

        // skip this neighbor if it has been inspected before
        if (neighbor.closed || neighbor.opened) {
          continue;
        }

        openList.push(neighbor);
        neighbor.opened = true;
        neighbor.parent = node;
      }
    }
    
    // fail to find the path
    return [];
  }
}

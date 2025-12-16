// Physics engine for movement and collisions
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/engine/physics.js',
  exports: ['PhysicsEngine', 'checkCollision', 'resolveCollision', 'checkCircleCollision', 'checkCircleRectCollision', 'checkLineCollision', 'checkPointInRect', 'checkPointInCircle', 'getCollisionNormal', 'separateAABB', 'raycast', 'sweepAABB'],
  dependencies: ['clamp', 'distance', 'Vector2D']
});

/**
 * Simple physics engine
 */
window.PhysicsEngine = class {
  constructor() {
    this.gravity = 800; // pixels per second squared
    this.friction = 0.9;
  }

  /**
   * Apply physics to an entity
   * @param {Object} entity - Entity with position, velocity, acceleration
   * @param {number} dt - Delta time in seconds
   */
  applyPhysics(entity, dt) {
    // Apply acceleration to velocity
    entity.vx += entity.ax * dt;
    entity.vy += entity.ay * dt;

    // Apply gravity if enabled
    if (entity.useGravity) {
      entity.vy += this.gravity * dt;
    }

    // Apply friction
    entity.vx *= this.friction;
    entity.vy *= this.friction;

    // Update position
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;

    // Reset acceleration
    entity.ax = 0;
    entity.ay = 0;
  }

  /**
   * Keep entity within canvas bounds
   * @param {Object} entity - Entity with x, y, width, height
   */
  keepInBounds(entity) {
    entity.x = window.clamp(entity.x, 0, 1920 - entity.width);
    entity.y = window.clamp(entity.y, 0, 1080 - entity.height);
  }
};

/**
 * Check collision between two rectangles (AABB)
 * @param {Object} a - First entity with x, y, width, height
 * @param {Object} b - Second entity with x, y, width, height
 * @returns {boolean} Whether collision occurred
 */
window.checkCollision = function(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
};

/**
 * Simple collision resolution - push entities apart
 * @param {Object} a - First entity
 * @param {Object} b - Second entity
 */
window.resolveCollision = function(a, b) {
  // Calculate overlap on both axes
  const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
  const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

  // Resolve on axis with smallest overlap
  if (overlapX < overlapY) {
    if (a.x < b.x) {
      a.x -= overlapX / 2;
      b.x += overlapX / 2;
    } else {
      a.x += overlapX / 2;
      b.x -= overlapX / 2;
    }
  } else {
    if (a.y < b.y) {
      a.y -= overlapY / 2;
      b.y += overlapY / 2;
    } else {
      a.y += overlapY / 2;
      b.y -= overlapY / 2;
    }
  }
};

/**
 * Check collision between two circles
 * @param {Object} a - First circle with x, y, radius
 * @param {Object} b - Second circle with x, y, radius
 * @returns {boolean} Whether collision occurred
 */
window.checkCircleCollision = function(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
};

/**
 * Check collision between circle and rectangle
 * @param {Object} circle - Circle with x, y, radius
 * @param {Object} rect - Rectangle with x, y, width, height
 * @returns {boolean} Whether collision occurred
 */
window.checkCircleRectCollision = function(circle, rect) {
  // Find closest point on rectangle to circle center
  const closestX = window.clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = window.clamp(circle.y, rect.y, rect.y + rect.height);
  
  // Calculate distance from circle center to closest point
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSquared = dx * dx + dy * dy;
  
  return distanceSquared < circle.radius * circle.radius;
};

/**
 * Check collision between two line segments
 * @param {Object} line1 - First line with x1, y1, x2, y2
 * @param {Object} line2 - Second line with x1, y1, x2, y2
 * @returns {boolean} Whether collision occurred
 */
window.checkLineCollision = function(line1, line2) {
  const x1 = line1.x1, y1 = line1.y1, x2 = line1.x2, y2 = line1.y2;
  const x3 = line2.x1, y3 = line2.y1, x4 = line2.x2, y4 = line2.y2;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.0001) return false; // Parallel lines
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};

/**
 * Check if point is inside rectangle
 * @param {number} px - Point x
 * @param {number} py - Point y
 * @param {Object} rect - Rectangle with x, y, width, height
 * @returns {boolean} Whether point is inside rectangle
 */
window.checkPointInRect = function(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.width &&
         py >= rect.y && py <= rect.y + rect.height;
};

/**
 * Check if point is inside circle
 * @param {number} px - Point x
 * @param {number} py - Point y
 * @param {Object} circle - Circle with x, y, radius
 * @returns {boolean} Whether point is inside circle
 */
window.checkPointInCircle = function(px, py, circle) {
  const dx = px - circle.x;
  const dy = py - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
};

/**
 * Get collision normal between two AABB rectangles
 * @param {Object} a - First rectangle
 * @param {Object} b - Second rectangle
 * @returns {Vector2D} Collision normal
 */
window.getCollisionNormal = function(a, b) {
  const centerAX = a.x + a.width / 2;
  const centerAY = a.y + a.height / 2;
  const centerBX = b.x + b.width / 2;
  const centerBY = b.y + b.height / 2;
  
  const dx = centerBX - centerAX;
  const dy = centerBY - centerAY;
  
  const overlapX = (a.width + b.width) / 2 - Math.abs(dx);
  const overlapY = (a.height + b.height) / 2 - Math.abs(dy);
  
  const normal = window.Vector2D.pool.get();
  
  if (overlapX < overlapY) {
    normal.set(dx > 0 ? 1 : -1, 0);
  } else {
    normal.set(0, dy > 0 ? 1 : -1);
  }
  
  return normal;
};

/**
 * Separate two AABB rectangles
 * @param {Object} a - First rectangle
 * @param {Object} b - Second rectangle
 * @param {Vector2D} normal - Collision normal
 * @returns {number} Separation distance
 */
window.separateAABB = function(a, b, normal) {
  const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
  const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);
  
  const separation = Math.min(overlapX, overlapY);
  
  a.x -= normal.x * separation * 0.5;
  a.y -= normal.y * separation * 0.5;
  b.x += normal.x * separation * 0.5;
  b.y += normal.y * separation * 0.5;
  
  return separation;
};

/**
 * Raycast against AABB rectangles
 * @param {Vector2D} origin - Ray origin
 * @param {Vector2D} direction - Ray direction (normalized)
 * @param {number} maxDistance - Maximum ray distance
 * @param {Object} rect - Rectangle to test against
 * @returns {Object|null} Hit information or null
 */
window.raycast = function(origin, direction, maxDistance, rect) {
  const invDir = window.Vector2D.pool.get(1 / direction.x, 1 / direction.y);
  
  const t1 = (rect.x - origin.x) * invDir.x;
  const t2 = (rect.x + rect.width - origin.x) * invDir.x;
  const t3 = (rect.y - origin.y) * invDir.y;
  const t4 = (rect.y + rect.height - origin.y) * invDir.y;
  
  const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
  const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
  
  window.Vector2D.pool.release(invDir);
  
  if (tmax < 0 || tmin > tmax || tmin > maxDistance) {
    return null;
  }
  
  const hitPoint = window.Vector2D.pool.get(
    origin.x + direction.x * tmin,
    origin.y + direction.y * tmin
  );
  
  const result = {
    distance: tmin,
    point: hitPoint,
    normal: null
  };
  
  // Calculate normal
  const eps = 0.001;
  const localX = hitPoint.x - rect.x;
  const localY = hitPoint.y - rect.y;
  
  if (Math.abs(localX) < eps) {
    result.normal = window.Vector2D.pool.get(-1, 0);
  } else if (Math.abs(localX - rect.width) < eps) {
    result.normal = window.Vector2D.pool.get(1, 0);
  } else if (Math.abs(localY) < eps) {
    result.normal = window.Vector2D.pool.get(0, -1);
  } else {
    result.normal = window.Vector2D.pool.get(0, 1);
  }
  
  return result;
};

/**
 * Sweep test for moving AABB against another AABB
 * @param {Object} moving - Moving rectangle with vx, vy
 * @param {Object} static - Static rectangle
 * @param {number} dt - Delta time
 * @returns {Object|null} Collision info or null
 */
window.sweepAABB = function(moving, static, dt) {
  if (!moving.vx && !moving.vy) return null;
  
  const expandedRect = {
    x: static.x - moving.width / 2,
    y: static.y - moving.height / 2,
    width: static.width + moving.width,
    height: static.height + moving.height
  };
  
  const origin = window.Vector2D.pool.get(
    moving.x + moving.width / 2,
    moving.y + moving.height / 2
  );
  
  const direction = window.Vector2D.pool.get(moving.vx, moving.vy);
  const speed = direction.magnitude();
  
  if (speed > 0) {
    direction.normalize();
  }
  
  const result = window.raycast(origin, direction, speed * dt, expandedRect);
  
  window.Vector2D.pool.release(origin);
  window.Vector2D.pool.release(direction);
  
  if (result) {
    return {
      time: result.distance / speed,
      normal: result.normal,
      willCollide: true
    };
  }
  
  return null;
};
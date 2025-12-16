// Math utilities for game calculations
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/utils/math.js',
  exports: [
    'clamp', 'lerp', 'distance', 'randomRange', 'randomChoice',
    'Vector2D', 'VECTOR2D_ZERO', 'VECTOR2D_UP', 'VECTOR2D_DOWN', 'VECTOR2D_LEFT', 'VECTOR2D_RIGHT',
    'MATH', 'degToRad', 'radToDeg', 'approxEqual', 'isPowerOfTwo', 'nextPowerOfTwo',
    'wrapAngle', 'lerpClamped', 'inverseLerp', 'smoothstep', 'sign', 'inRange',
    'mapRange', 'percent', 'logLerp', 'expLerp', 'damp', 'dampAngle', 'bounce', 'elastic'
  ],
  dependencies: []
});

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
window.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
window.lerp = function(start, end, t) {
  return start + (end - start) * t;
};

/**
 * Calculate distance between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Distance
 */
window.distance = function(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
window.randomRange = function(min, max) {
  return Math.random() * (max - min) + min;
};

/**
 * Get random choice from array
 * @param {Array} array - Array to choose from
 * @returns {*} Random element
 */
window.randomChoice = function(array) {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 2D Vector class for position, velocity, and direction calculations
 * Designed for object pooling - no allocation in game loop
 */
window.Vector2D = class {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Set vector components
   * @param {number} x - X component
   * @param {number} y - Y component
   * @returns {Vector2D} This vector for chaining
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Copy another vector
   * @param {Vector2D} other - Vector to copy
   * @returns {Vector2D} This vector for chaining
   */
  copy(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  /**
   * Add another vector to this one
   * @param {Vector2D} other - Vector to add
   * @returns {Vector2D} This vector for chaining
   */
  add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  /**
   * Subtract another vector from this one
   * @param {Vector2D} other - Vector to subtract
   * @returns {Vector2D} This vector for chaining
   */
  subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /**
   * Multiply vector by scalar
   * @param {number} scalar - Scalar value
   * @returns {Vector2D} This vector for chaining
   */
  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Divide vector by scalar
   * @param {number} scalar - Scalar value
   * @returns {Vector2D} This vector for chaining
   */
  divide(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  /**
   * Get magnitude (length) of vector
   * @returns {number} Magnitude
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Get squared magnitude (avoids sqrt for performance)
   * @returns {number} Squared magnitude
   */
  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize vector to unit length
   * @returns {Vector2D} This vector for chaining
   */
  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  /**
   * Get normalized copy of vector
   * @returns {Vector2D} New normalized vector
   */
  normalized() {
    const result = window.Vector2D.pool.get();
    result.copy(this);
    result.normalize();
    return result;
  }

  /**
   * Get dot product with another vector
   * @param {Vector2D} other - Other vector
   * @returns {number} Dot product
   */
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Get cross product with another vector (returns scalar)
   * @param {Vector2D} other - Other vector
   * @returns {number} Cross product
   */
  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  /**
   * Get distance to another vector
   * @param {Vector2D} other - Other vector
   * @returns {number} Distance
   */
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get squared distance to another vector (avoids sqrt)
   * @param {Vector2D} other - Other vector
   * @returns {number} Squared distance
   */
  distanceToSquared(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  /**
   * Linear interpolation to another vector
   * @param {Vector2D} other - Target vector
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Vector2D} This vector for chaining
   */
  lerp(other, t) {
    this.x = window.lerp(this.x, other.x, t);
    this.y = window.lerp(this.y, other.y, t);
    return this;
  }

  /**
   * Check if vector equals another (with optional tolerance)
   * @param {Vector2D} other - Other vector
   * @param {number} tolerance - Comparison tolerance (default: 0.0001)
   * @returns {boolean} Whether vectors are equal
   */
  equals(other, tolerance = 0.0001) {
    return Math.abs(this.x - other.x) <= tolerance && 
           Math.abs(this.y - other.y) <= tolerance;
  }

  /**
   * Clamp vector components between min and max vectors
   * @param {Vector2D} min - Minimum vector
   * @param {Vector2D} max - Maximum vector
   * @returns {Vector2D} This vector for chaining
   */
  clamp(min, max) {
    this.x = window.clamp(this.x, min.x, max.x);
    this.y = window.clamp(this.y, min.y, max.y);
    return this;
  }

  /**
   * Get angle of vector in radians
   * @returns {number} Angle in radians
   */
  angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Rotate vector by angle in radians
   * @param {number} angle - Angle in radians
   * @returns {Vector2D} This vector for chaining
   */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
    return this;
  }

  /**
   * Create a copy of this vector
   * @returns {Vector2D} New vector copy
   */
  clone() {
    const result = window.Vector2D.pool.get();
    result.copy(this);
    return result;
  }

  /**
   * Reset vector to zero
   * @returns {Vector2D} This vector for chaining
   */
  zero() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  /**
   * Check if vector is zero
   * @returns {boolean} Whether vector is zero
   */
  isZero() {
    return this.x === 0 && this.y === 0;
  }

  /**
   * Get string representation
   * @returns {string} String representation
   */
  toString() {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  /**
   * Object pool for Vector2D instances
   * Reuses vectors to avoid garbage collection
   */
  static pool = {
    vectors: [],
    
    /**
     * Get a vector from the pool
     * @param {number} x - Optional x value
     * @param {number} y - Optional y value
     * @returns {Vector2D} Vector from pool
     */
    get(x = 0, y = 0) {
      if (this.vectors.length > 0) {
        const vector = this.vectors.pop();
        vector.set(x, y);
        return vector;
      }
      return new Vector2D(x, y);
    },

    /**
     * Return vector to pool
     * @param {Vector2D} vector - Vector to return
     */
    release(vector) {
      if (vector instanceof Vector2D && this.vectors.length < 100) {
        vector.zero();
        this.vectors.push(vector);
      }
    },

    /**
     * Clear pool
     */
    clear() {
      this.vectors.length = 0;
    }
  };
};

// Common vector constants
window.VECTOR2D_ZERO = new Vector2D(0, 0);
window.VECTOR2D_UP = new Vector2D(0, -1);
window.VECTOR2D_DOWN = new Vector2D(0, 1);
window.VECTOR2D_LEFT = new Vector2D(-1, 0);
window.VECTOR2D_RIGHT = new Vector2D(1, 0);

/**
 * Math constants
 */
window.MATH = {
  PI: Math.PI,
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI / 2,
  QUARTER_PI: Math.PI / 4,
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
  EPSILON: 0.0001,
  INFINITY: Infinity,
  NEG_INFINITY: -Infinity
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
window.degToRad = function(degrees) {
  return degrees * window.MATH.DEG_TO_RAD;
};

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
window.radToDeg = function(radians) {
  return radians * window.MATH.RAD_TO_DEG;
};

/**
 * Check if number is approximately equal to another
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} epsilon - Tolerance (default: MATH.EPSILON)
 * @returns {boolean} Whether numbers are approximately equal
 */
window.approxEqual = function(a, b, epsilon = window.MATH.EPSILON) {
  return Math.abs(a - b) <= epsilon;
};

/**
 * Check if number is power of two
 * @param {number} value - Value to check
 * @returns {boolean} Whether value is power of two
 */
window.isPowerOfTwo = function(value) {
  return value > 0 && (value & (value - 1)) === 0;
};

/**
 * Get next power of two greater than or equal to value
 * @param {number} value - Input value
 * @returns {number} Next power of two
 */
window.nextPowerOfTwo = function(value) {
  if (value <= 0) return 1;
  value--;
  value |= value >> 1;
  value |= value >> 2;
  value |= value >> 4;
  value |= value >> 8;
  value |= value >> 16;
  value++;
  return value;
};

/**
 * Wrap angle to range [-PI, PI]
 * @param {number} angle - Angle in radians
 * @returns {number} Wrapped angle
 */
window.wrapAngle = function(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

/**
 * Linear interpolation with clamping
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor
 * @returns {number} Interpolated value
 */
window.lerpClamped = function(start, end, t) {
  t = window.clamp(t, 0, 1);
  return window.lerp(start, end, t);
};

/**
 * Inverse linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} value - Current value
 * @returns {number} Interpolation factor (0-1)
 */
window.inverseLerp = function(start, end, value) {
  if (window.approxEqual(start, end)) return 0;
  return window.clamp((value - start) / (end - start), 0, 1);
};

/**
 * Smooth step function
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Input value
 * @returns {number} Smoothed value
 */
window.smoothstep = function(edge0, edge1, x) {
  const t = window.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Sign function
 * @param {number} value - Input value
 * @returns {number} -1, 0, or 1
 */
window.sign = function(value) {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
};

/**
 * Check if value is in range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Whether value is in range
 */
window.inRange = function(value, min, max) {
  return value >= min && value <= max;
};

/**
 * Map value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
window.mapRange = function(value, inMin, inMax, outMin, outMax) {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
};

/**
 * Get percentage of value between min and max
 * @param {number} value - Input value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Percentage (0-1)
 */
window.percent = function(value, min, max) {
  return window.clamp((value - min) / (max - min), 0, 1);
};

/**
 * Logarithmic interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor
 * @returns {number} Log interpolated value
 */
window.logLerp = function(start, end, t) {
  if (start <= 0 || end <= 0) return window.lerp(start, end, t);
  return start * Math.pow(end / start, t);
};

/**
 * Exponential interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor
 * @param {number} power - Exponent power
 * @returns {number} Exponentially interpolated value
 */
window.expLerp = function(start, end, t, power = 2) {
  return start + (end - start) * Math.pow(t, power);
};

/**
 * Damping function for smooth transitions
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} damping - Damping factor (0-1)
 * @returns {number} Damped value
 */
window.damp = function(current, target, damping) {
  return current + (target - current) * damping;
};

/**
 * Angular damping for smooth rotation
 * @param {number} current - Current angle in radians
 * @param {number} target - Target angle in radians
 * @param {number} damping - Damping factor (0-1)
 * @returns {number} Damped angle
 */
window.dampAngle = function(current, target, damping) {
  let delta = target - current;
  delta = window.wrapAngle(delta);
  return current + delta * damping;
};

/**
 * Bounce easing function
 * @param {number} t - Input value (0-1)
 * @param {number} bounces - Number of bounces (default: 3)
 * @returns {number} Bounced value
 */
window.bounce = function(t, bounces = 3) {
  if (t >= 1) return 1;
  
  const bounceN = Math.floor(bounces);
  const bounceHeight = 1 / Math.pow(2, bounceN);
  
  if (t < bounceHeight) {
    return t / bounceHeight;
  }
  
  const bounceTime = (t - bounceHeight) / (1 - bounceHeight);
  const bounceT = bounceTime * bounceN;
  const bounceIndex = Math.floor(bounceT);
  const bounceLocal = bounceT - bounceIndex;
  
  return Math.abs(Math.sin(bounceLocal * Math.PI)) * Math.pow(0.5, bounceIndex + 1);
};

/**
 * Elastic easing function
 * @param {number} t - Input value (0-1)
 * @param {number} amplitude - Oscillation amplitude
 * @param {number} period - Oscillation period
 * @returns {number} Elastic value
 */
window.elastic = function(t, amplitude = 1, period = 0.3) {
  if (t === 0 || t === 1) return t;
  
  const s = period / 4;
  const decay = amplitude * Math.pow(2, -10 * t);
  const oscillation = Math.sin((t - s) * Math.PI * 2 / period);
  
  return 1 + decay * oscillation;
};
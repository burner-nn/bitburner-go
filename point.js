export class Point
{
    static x(value) { return value & 255; }
    static y(value) { return value >> 8; }

    static toString(value) { return "(" + Point.x(value) + "," + Point.y(value) + ")"; }

    static fromXY(x, y) { return x + (y << 8); }
};

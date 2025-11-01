// Binary data type serialization (little-endian struct packing)
export function packInt32(value) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeInt32LE(value, 0);
    return buf;
}
export function unpackInt32(buffer, offset = 0) {
    return buffer.readInt32LE(offset);
}
export function packUInt32(value) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeUInt32LE(value, 0);
    return buf;
}
export function unpackUInt32(buffer, offset = 0) {
    return buffer.readUInt32LE(offset);
}
export function packUInt16(value) {
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16LE(value, 0);
    return buf;
}
export function unpackUInt16(buffer, offset = 0) {
    return buffer.readUInt16LE(offset);
}
export function packInt16(value) {
    const buf = Buffer.allocUnsafe(2);
    buf.writeInt16LE(value, 0);
    return buf;
}
export function unpackInt16(buffer, offset = 0) {
    return buffer.readInt16LE(offset);
}
export function packUInt8(value) {
    const buf = Buffer.allocUnsafe(1);
    buf.writeUInt8(value, 0);
    return buf;
}
export function unpackUInt8(buffer, offset = 0) {
    return buffer.readUInt8(offset);
}
export function packInt8(value) {
    const buf = Buffer.allocUnsafe(1);
    buf.writeInt8(value, 0);
    return buf;
}
export function unpackInt8(buffer, offset = 0) {
    return buffer.readInt8(offset);
}
export function packBool(value) {
    const buf = Buffer.allocUnsafe(1);
    buf.writeUInt8(value ? 1 : 0, 0);
    return buf;
}
export function unpackBool(buffer, offset = 0) {
    return buffer.readUInt8(offset) !== 0;
}
export function packString(value) {
    const strBytes = Buffer.from(value, 'utf-8');
    const length = packUInt32(strBytes.length);
    return Buffer.concat([length, strBytes]);
}
export function unpackString(buffer, offset = 0) {
    const length = unpackUInt32(buffer, offset);
    const start = offset + 4;
    return buffer.toString('utf-8', start, start + length);
}
export function packDouble(value) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeDoubleLE(value, 0);
    return buf;
}
export function unpackDouble(buffer, offset = 0) {
    return buffer.readDoubleLE(offset);
}
export function packFloat(value) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeFloatLE(value, 0);
    return buf;
}
export function unpackFloat(buffer, offset = 0) {
    return buffer.readFloatLE(offset);
}

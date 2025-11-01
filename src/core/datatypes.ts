// Binary data type serialization (little-endian struct packing)

export function packInt32(value: number): Buffer {
  const buf = Buffer.allocUnsafe(4);
  buf.writeInt32LE(value, 0);
  return buf;
}

export function unpackInt32(buffer: Buffer, offset: number = 0): number {
  return buffer.readInt32LE(offset);
}

export function packUInt32(value: number): Buffer {
  const buf = Buffer.allocUnsafe(4);
  buf.writeUInt32LE(value, 0);
  return buf;
}

export function unpackUInt32(buffer: Buffer, offset: number = 0): number {
  return buffer.readUInt32LE(offset);
}

export function packUInt16(value: number): Buffer {
  const buf = Buffer.allocUnsafe(2);
  buf.writeUInt16LE(value, 0);
  return buf;
}

export function unpackUInt16(buffer: Buffer, offset: number = 0): number {
  return buffer.readUInt16LE(offset);
}

export function packInt16(value: number): Buffer {
  const buf = Buffer.allocUnsafe(2);
  buf.writeInt16LE(value, 0);
  return buf;
}

export function unpackInt16(buffer: Buffer, offset: number = 0): number {
  return buffer.readInt16LE(offset);
}

export function packUInt8(value: number): Buffer {
  const buf = Buffer.allocUnsafe(1);
  buf.writeUInt8(value, 0);
  return buf;
}

export function unpackUInt8(buffer: Buffer, offset: number = 0): number {
  return buffer.readUInt8(offset);
}

export function packInt8(value: number): Buffer {
  const buf = Buffer.allocUnsafe(1);
  buf.writeInt8(value, 0);
  return buf;
}

export function unpackInt8(buffer: Buffer, offset: number = 0): number {
  return buffer.readInt8(offset);
}

export function packBool(value: boolean): Buffer {
  const buf = Buffer.allocUnsafe(1);
  buf.writeUInt8(value ? 1 : 0, 0);
  return buf;
}

export function unpackBool(buffer: Buffer, offset: number = 0): boolean {
  return buffer.readUInt8(offset) !== 0;
}

export function packString(value: string): Buffer {
  // Stealth uses UTF-16LE encoding (like Windows)
  const strBytes = Buffer.from(value, 'utf-16le');
  const length = packUInt32(strBytes.length);
  return Buffer.concat([length, strBytes]);
}

export function unpackString(buffer: Buffer, offset: number = 0): string {
  const length = unpackUInt32(buffer, offset);
  const start = offset + 4;
  // Stealth uses UTF-16LE encoding (like Windows)
  return buffer.toString('utf-16le', start, start + length);
}

export function packDouble(value: number): Buffer {
  const buf = Buffer.allocUnsafe(8);
  buf.writeDoubleLE(value, 0);
  return buf;
}

export function unpackDouble(buffer: Buffer, offset: number = 0): number {
  return buffer.readDoubleLE(offset);
}

export function packFloat(value: number): Buffer {
  const buf = Buffer.allocUnsafe(4);
  buf.writeFloatLE(value, 0);
  return buf;
}

export function unpackFloat(buffer: Buffer, offset: number = 0): number {
  return buffer.readFloatLE(offset);
}

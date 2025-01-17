/**
 * isArrayBufferSlice
 *
 * Checks if the ArrayBufferView represents a slice (subarray or a subview)
 * of an ArrayBuffer.
 *
 * An ArrayBufferView (TypedArray or DataView) can represent a portion of an
 * ArrayBuffer - such a view is said to be a "slice" of the original buffer.
 * This can occur when the `subarray` or `slice` method is called on a
 * TypedArray or when a DataView is created with a byteOffset and/or
 * byteLength that doesn't cover the full ArrayBuffer.
 *
 * @param arrayBufferView - The ArrayBufferView to be checked
 * @returns true if the ArrayBufferView represents a slice of an ArrayBuffer; false otherwise.
 */
export function isArrayBufferSlice(arrayBufferView: ArrayBufferView): boolean {
  return arrayBufferView.byteOffset !== 0 || arrayBufferView.byteLength !== arrayBufferView.buffer.byteLength;
}

/**
 * isDefined
 *
 * Utility function to check if a variable is neither null nor undefined.
 * This function helps in making TypeScript infer the type of the variable
 * as being defined, excluding `null` and `undefined`.
 *
 * The function uses strict equality (`!==`) for the comparison, ensuring
 * that the variable is not just falsy (like an empty string or zero),
 * but is truly either `null` or `undefined`.
 *
 * @param arg - The variable to be checked
 * @returns true if the variable is neither `null` nor `undefined`
 */
export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && typeof arg !== 'undefined';
}

/**
 * universalTypeOf
 *
 * Why does this function exist?
 *
 * You can typically check if a value is of a particular type, such as
 * Uint8Array or ArrayBuffer, by using the `instanceof` operator. The
 * `instanceof` operator checks the prototype property of a constructor
 * in the object's prototype chain.
 *
 * However, there is a caveat with the `instanceof` check if the value
 * was created from a different JavaScript context (like an iframe or
 * a web worker). In those cases, the `instanceof` check might fail
 * because each context has a different global object, and therefore,
 * different built-in constructor functions.
 *
 * The `typeof` operator provides information about the type of the
 * operand in a less detailed way. For basic data types like number,
 * string, boolean, and undefined, the `typeof` operator works as
 * expected.  However, for objects, including arrays and null,
 * it always returns "object".  For functions, it returns "function".
 * So, while `typeof` is good for basic type checking, it doesn't
 * give detailed information about complex data types.
 *
 * Unlike `instanceof` and `typeof`, `Object.prototype.toString.call(value)`
 * can ensure a consistent result across different JavaScript
 * contexts.
 *
 * Credit for inspiration:
 *   Angus Croll
 *   https://github.com/angus-c
 *   https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
 */
export function universalTypeOf(value: unknown) {
  // Returns '[Object Type]' string.
  const typeString = Object.prototype.toString.call(value);
  // Returns ['Object', 'Type'] array or null.
  const match = typeString.match(/\s([a-zA-Z0-9]+)/);
  // Deconstructs the array and gets just the type from index 1.
  const [_, type] = match as RegExpMatchArray;

  return type;
}
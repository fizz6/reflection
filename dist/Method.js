"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Method {
    constructor(propertyDescriptor) {
        this.m_propertyDescriptor = propertyDescriptor;
    }
    static Of(constructor) {
        if (!Method.m_cache.has(constructor)) {
            const methods = Object.getOwnPropertyNames(constructor.prototype)
                .map((propertyName) => {
                const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName);
                return new Method(descriptor);
            });
            Method.m_cache.set(constructor, new Set(methods));
        }
        return Method.m_cache.get(constructor);
    }
    get configurable() {
        return this.m_propertyDescriptor.configurable === undefined
            ? false
            : this.m_propertyDescriptor.configurable;
    }
    get enumerable() {
        return this.m_propertyDescriptor.enumerable === undefined
            ? false
            : this.m_propertyDescriptor.enumerable;
    }
    get writable() {
        return this.m_propertyDescriptor.writable === undefined
            ? false
            : this.m_propertyDescriptor.writable;
    }
    invoke(target, ...args) {
        if (!(this.m_propertyDescriptor.value instanceof Function)) {
            throw new Error(`'${this.m_propertyDescriptor.value}' cannot be invoked`);
        }
        return this.m_propertyDescriptor.value.call(target, ...args);
    }
}
Method.m_cache = new Map();
exports.default = Method;

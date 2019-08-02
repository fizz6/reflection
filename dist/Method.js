"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Reflection_1 = require("./Reflection");
const Type_1 = require("./Type");
class Method {
    constructor(constructor, name, propertyDescriptor) {
        this.m_constructor = constructor;
        this.m_name = name;
        this.m_propertyDescriptor = propertyDescriptor;
    }
    static shallow(constructor) {
        if (!Method.m_shallow.has(constructor)) {
            const methods = Object.getOwnPropertyNames(constructor.prototype)
                .reduce((state, propertyName) => {
                if (propertyName === 'constructor') {
                    return state;
                }
                const propertyDescriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName);
                if (propertyDescriptor.value === undefined || propertyDescriptor.get !== undefined || propertyDescriptor.set !== undefined) {
                    return state;
                }
                const method = new Method(constructor, propertyName, propertyDescriptor);
                return state.set(propertyName, method);
            }, new Map());
            Method.m_shallow.set(constructor, methods);
        }
        return Method.m_shallow.get(constructor);
    }
    static deep(constructor) {
        if (!Method.m_deep.has(constructor)) {
            const prototypes = Reflection_1.default.Prototypes(constructor);
            const methods = Array.from(prototypes)
                .reduce((state, constructor) => {
                const methods = Method.shallow(constructor);
                methods.forEach((method) => state.set(method.name, method));
                return state;
            }, new Map());
            Method.m_deep.set(constructor, methods);
        }
        return Method.m_deep.get(constructor);
    }
    get type() {
        return Type_1.default.of(this.m_constructor);
    }
    get name() {
        return this.m_name;
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
            throw new Error();
        }
        return this.m_propertyDescriptor.value.call(target, ...args);
    }
}
Method.m_shallow = new Map();
Method.m_deep = new Map();
exports.default = Method;

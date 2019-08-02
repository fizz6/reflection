"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Reflection_1 = require("./Reflection");
const Type_1 = require("./Type");
class Property {
    constructor(constructor, name, propertyDescriptor) {
        this.m_constructor = constructor;
        this.m_name = name;
        this.m_propertyDescriptor = propertyDescriptor;
    }
    static shallow(constructor) {
        if (!Property.m_shallow.has(constructor)) {
            const properties = new Map();
            Property.shallowReal(constructor)
                .forEach((property, propertyName) => properties.set(propertyName, property));
            Property.shallowVirtual(constructor)
                .forEach((property, propertyName) => properties.set(propertyName, property));
            Property.m_shallow.set(constructor, properties);
        }
        return Property.m_shallow.get(constructor);
    }
    static shallowReal(constructor) {
        const prototype = constructor.prototype.__proto__ === undefined
            ? undefined
            : constructor.prototype.__proto__.constructor;
        return prototype === undefined
            ? Property.deepReal(constructor)
            : Array.from(Property.deepReal(prototype).keys())
                .reduce((state, propertyName) => {
                state.delete(propertyName);
                return state;
            }, new Map(Property.deepReal(constructor)));
    }
    static shallowVirtual(constructor) {
        return Object.getOwnPropertyNames(constructor.prototype)
            .reduce((state, propertyName) => {
            if (propertyName === 'constructor') {
                return state;
            }
            const propertyDescriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName);
            if (propertyDescriptor.value !== undefined && propertyDescriptor.get === undefined && propertyDescriptor.set === undefined) {
                return state;
            }
            const property = new Property(constructor, propertyName, propertyDescriptor);
            return state.set(propertyName, property);
        }, new Map());
    }
    static deep(constructor) {
        if (!Property.m_deep.has(constructor)) {
            const properties = new Map();
            Property.deepReal(constructor)
                .forEach((property, propertyName) => properties.set(propertyName, property));
            Property.deepVirtual(constructor)
                .forEach((property, propertyName) => properties.set(propertyName, property));
            Property.m_deep.set(constructor, properties);
        }
        return Property.m_deep.get(constructor);
    }
    static deepReal(constructor) {
        let instance;
        try {
            instance = new constructor();
        }
        catch (_a) {
            throw new Error();
        }
        return Object.getOwnPropertyNames(instance)
            .reduce((state, propertyName) => {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(instance, propertyName);
            const field = new Property(constructor, propertyName, propertyDescriptor);
            return state.set(propertyName, field);
        }, new Map());
    }
    static deepVirtual(constructor) {
        const prototypes = Reflection_1.default.Prototypes(constructor);
        return Array.from(prototypes)
            .reduce((state, constructor) => {
            const properties = Property.shallowVirtual(constructor);
            properties.forEach((property) => state.set(property.name, property));
            return state;
        }, new Map());
    }
    get type() {
        return Type_1.default.of(this.m_constructor);
    }
    get name() {
        return this.m_name;
    }
    get isVirtual() {
        return this.m_propertyDescriptor.get !== undefined || this.m_propertyDescriptor.set !== undefined;
    }
    get isConfigurable() {
        return this.m_propertyDescriptor.configurable === undefined
            ? false
            : this.m_propertyDescriptor.configurable;
    }
    get isEnumerable() {
        return this.m_propertyDescriptor.enumerable === undefined
            ? false
            : this.m_propertyDescriptor.enumerable;
    }
    get isWritable() {
        return this.m_propertyDescriptor.writable === undefined
            ? false
            : this.m_propertyDescriptor.writable;
    }
    get(target) {
        if (this.isVirtual) {
            if (this.m_propertyDescriptor.get === undefined) {
                throw new Error();
            }
            return this.m_propertyDescriptor.get.call(target);
        }
        return target[this.m_name];
    }
    set(target, value) {
        if (this.isVirtual) {
            if (this.m_propertyDescriptor.set === undefined) {
                throw new Error();
            }
            return this.m_propertyDescriptor.set.call(target, value);
        }
        target[this.m_name] = value;
    }
}
Property.m_shallow = new Map();
Property.m_deep = new Map();
exports.default = Property;

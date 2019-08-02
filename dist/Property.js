"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Reflection_1 = require("./Reflection");
class Property {
    constructor(propertyDescriptor) {
        this.m_propertyDescriptor = propertyDescriptor;
    }
    static Of(constructor) {
        if (!Property.m_cache.has(constructor)) {
            let instance;
            try {
                instance = new constructor();
            }
            catch (_a) {
                instance = Object.create(constructor.prototype);
            }
            const prototypes = Reflection_1.default.Prototypes(constructor);
            const properties = Object.getOwnPropertyNames(instance)
                .map((propertyName) => {
                const descriptor = Object.getOwnPropertyDescriptor(instance, propertyName);
                return new Property(descriptor);
            });
            Property.m_cache.set(constructor, new Set(properties));
        }
        return Property.m_cache.get(constructor);
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
}
Property.m_cache = new Map();
exports.default = Property;

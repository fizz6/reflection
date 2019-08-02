"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Method_1 = require("./Method");
const Property_1 = require("./Property");
class Type {
    constructor(constructor) {
        this.m_constructor = constructor;
    }
    static of(constructor) {
        if (!Type.m_cache.has(constructor)) {
            const type = new Type(constructor);
            Type.m_cache.set(constructor, type);
        }
        return Type.m_cache.get(constructor);
    }
    get methods() {
        if (this.m_methods === undefined) {
            this.m_methods = Method_1.default.deep(this.m_constructor);
        }
        return this.m_methods;
    }
    get properties() {
        if (this.m_properties === undefined) {
            this.m_properties = Property_1.default.deep(this.m_constructor);
        }
        return this.m_properties;
    }
}
Type.m_cache = new Map();
exports.default = Type;

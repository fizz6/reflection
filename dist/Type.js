"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Method_1 = require("./Method");
const Property_1 = require("./Property");
class Type {
    constructor(constructor) {
        this.m_properties = Property_1.default.Of(constructor);
        this.m_methods = Method_1.default.Of(constructor);
    }
    static Of(constructor) {
        if (!Type.m_cache.has(constructor)) {
            const type = new Type(constructor);
            Type.m_cache.set(constructor, type);
        }
        return Type.m_cache.get(constructor);
    }
    get properties() {
        return this.m_properties;
    }
    get methods() {
        return this.m_methods;
    }
}
Type.m_cache = new Map();
exports.default = Type;

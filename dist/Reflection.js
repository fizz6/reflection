"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Reflection {
    static Prototypes(constructor, out = new Set()) {
        out.add(constructor);
        constructor = constructor.prototype.__proto__.constructor;
        if (constructor === Object) {
            return out;
        }
        return Reflection.Prototypes(constructor, out);
    }
}
exports.default = Reflection;

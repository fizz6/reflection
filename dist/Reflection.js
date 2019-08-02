"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Reflection {
    static Prototypes(constructor, out = new Set()) {
        out.add(constructor);
        constructor = constructor.prototype.__proto__ === undefined
            ? undefined
            : constructor.prototype.__proto__.constructor;
        if (constructor === undefined || constructor === Object) {
            return out;
        }
        return Reflection.Prototypes(constructor, out);
    }
}
exports.default = Reflection;

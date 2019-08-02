export interface Constructor {
    new (...args: any[]): Object;
}

export default class Reflection {
    
    public static Prototypes(constructor: Constructor, out: Set<Constructor> = new Set()): Set<Constructor> {
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
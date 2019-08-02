import Reflection from './Reflection';

export interface Constructor {
    new (...args: any[]): Object;
}

export default class Property {
    
    private static m_shallow: Map<Constructor, Map<string, Property>> = new Map();
    
    private static m_deep: Map<Constructor, Map<string, Property>> = new Map();
    
    public static Shallow(constructor: Constructor): Map<string, Property> {
        if (!Property.m_shallow.has(constructor)) {
            let properties = new Map(Property.Deep(constructor));
            
            const prototype = constructor.prototype.__proto__ === undefined
                ? undefined
                : constructor.prototype.__proto__.constructor;
            if (prototype === undefined || prototype === Object) {
                return properties;
            }
            
            properties = Array.from(Property.Deep(prototype).keys())
                .reduce(
                    (state: Map<string, Property>, propertyName: string): Map<string, Property> => {
                        state.delete(propertyName);
                        return state;
                    },
                    properties
                );
            
            Property.m_shallow.set(constructor, properties);
        }
        
        return Property.m_shallow.get(constructor) as Map<string, Property>;
    }
    
    public static Deep(constructor: Constructor): Map<string, Property> {
        if (!Property.m_deep.has(constructor)) {
            let instance: Object;
            try {
                instance = new constructor();
            } catch {
                instance = Object.create(constructor.prototype);
            }
            
            let properties = Object.getOwnPropertyNames(instance)
                .reduce(
                    (state: Map<string, Property>, propertyName: string): Map<string, Property> => {
                        const descriptor = Object.getOwnPropertyDescriptor(instance, propertyName) as PropertyDescriptor;
                        const property = new Property(propertyName, descriptor);
                        return state.set(propertyName, property);
                    },
                    new Map()
                );
            
            // const prototypes = Reflection.Prototypes(constructor);
            
            // properties = Array.from(prototypes)
            //     .reduce(
            //         (state: Map<string, Property>, constructor: Constructor): Map<string, Property> => {
            //             Object.getOwnPropertyNames(constructor.prototype)
            //                 .forEach(
            //                     (propertyName: string): void => {
            //                         const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName) as PropertyDescriptor;
            //                         if (descriptor.get === undefined || descriptor.set === undefined) {
            //                             return;
            //                         }
                                    
            //                         const property = new Property(propertyName, descriptor);
            //                         state.set(propertyName, property);
            //                     }
            //                 );
            //             return state;
            //         },
            //         properties
            //     );
            
            Property.m_deep.set(constructor, properties);
        }
        
        return Property.m_deep.get(constructor) as Map<string, Property>;
    }

    private m_name: string;
    
    public get name(): string {
        return this.m_name;
    }

    private m_propertyDescriptor: PropertyDescriptor;
    
    public get configurable(): boolean {
        return this.m_propertyDescriptor.configurable === undefined
            ? false
            : this.m_propertyDescriptor.configurable;
    }
    
    public get enumerable(): boolean {
        return this.m_propertyDescriptor.enumerable === undefined
            ? false
            : this.m_propertyDescriptor.enumerable;
    }
    
    public get writable(): boolean {
        return this.m_propertyDescriptor.writable === undefined
            ? false
            : this.m_propertyDescriptor.writable;
    }
    
    public get(target: Object): any {
        if (this.m_propertyDescriptor.get === undefined) {
            return (target as any)[this.m_name];
        } else {
            return this.m_propertyDescriptor.get.call(target);
        }
    }
    
    public set(target: Object, value: any): void {
        if (this.m_propertyDescriptor.set === undefined) {
            (target as any)[this.m_name] = value;
        } else {
            this.m_propertyDescriptor.set.call(target, value);
        }
    }
    
    private constructor(name: string, propertyDescriptor: PropertyDescriptor) {
        this.m_name = name;
        this.m_propertyDescriptor = propertyDescriptor;
    }

}
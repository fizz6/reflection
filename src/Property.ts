import Reflection, { Constructor } from './Reflection';
import Type from './Type';

export default class Property {
    
    private static m_shallow: Map<Constructor, Map<string, Property>> = new Map();
    
    private static m_deep: Map<Constructor, Map<string, Property>> = new Map();
    
    public static shallow(constructor: Constructor): Map<string, Property> {
        if (!Property.m_shallow.has(constructor)) {
            const properties = new Map();
            Property.shallowReal(constructor)
                .forEach((property: Property, propertyName: string): Map<string, Property> => properties.set(propertyName, property));
            Property.shallowVirtual(constructor)
                .forEach((property: Property, propertyName: string): Map<string, Property> => properties.set(propertyName, property));
            Property.m_shallow.set(constructor, properties);
        }
        
        return Property.m_shallow.get(constructor) as Map<string, Property>;
    }
    
    private static shallowReal(constructor: Constructor): Map<string, Property> {
        const prototype = constructor.prototype.__proto__ === undefined
            ? undefined
            : constructor.prototype.__proto__.constructor;
            
        return prototype === undefined
            ? Property.deepReal(constructor)
            : Array.from(Property.deepReal(prototype).keys())
                .reduce(
                    (state: Map<string, Property>, propertyName: string): Map<string, Property> => {
                        state.delete(propertyName);
                        return state;
                    },
                    new Map(Property.deepReal(constructor))
                );
    }
    
    private static shallowVirtual(constructor: Constructor): Map<string, Property> {
        return Object.getOwnPropertyNames(constructor.prototype)
            .reduce(
                (state: Map<string, Property>, propertyName: string): Map<string, Property> => {
                    if (propertyName === 'constructor') {
                        return state;
                    }
                    
                    const propertyDescriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName) as PropertyDescriptor;
                    if (propertyDescriptor.value !== undefined && propertyDescriptor.get === undefined && propertyDescriptor.set === undefined) {
                        return state;
                    }
                    
                    const property = new Property(constructor, propertyName, propertyDescriptor);
                    return state.set(propertyName, property);
                },
                new Map()
            );
    }
    
    public static deep(constructor: Constructor): Map<string, Property> {
        if (!Property.m_deep.has(constructor)) {
            const properties = new Map();
            Property.deepReal(constructor)
                .forEach((property: Property, propertyName: string): Map<string, Property> => properties.set(propertyName, property));
            Property.deepVirtual(constructor)
                .forEach((property: Property, propertyName: string): Map<string, Property> => properties.set(propertyName, property));
            Property.m_deep.set(constructor, properties);
        }
        
        return Property.m_deep.get(constructor) as Map<string, Property>;
    }
    
    private static deepReal(constructor: Constructor): Map<string, Property> {
        let instance: Object;
        try {
            instance = new constructor();
        } catch {
            throw new Error();
        }
    
        return Object.getOwnPropertyNames(instance)
            .reduce(
                (state: Map<string, Property>, propertyName: string): Map<string, Property> => {
                    const propertyDescriptor = Object.getOwnPropertyDescriptor(instance, propertyName) as PropertyDescriptor;
                    const field = new Property(constructor, propertyName, propertyDescriptor);
                    return state.set(propertyName, field);
                },
                new Map()
            );
    }
    
    private static deepVirtual(constructor: Constructor): Map<string, Property> {
        const prototypes = Reflection.Prototypes(constructor);
        return Array.from(prototypes)
            .reduce(
                (state: Map<string, Property>, constructor: Constructor): Map<string, Property> => {
                    const properties = Property.shallowVirtual(constructor);
                    properties.forEach((property: Property): Map<string, Property> => state.set(property.name, property));
                    return state;
                },
                new Map()
            );
    }
    
    private m_constructor: Constructor;
    
    public get type(): Type {
        return Type.of(this.m_constructor);
    }

    private m_name: string;
    
    public get name(): string {
        return this.m_name;
    }

    private m_propertyDescriptor: PropertyDescriptor;
    
    public get isVirtual(): boolean {
        return this.m_propertyDescriptor.get !== undefined || this.m_propertyDescriptor.set !== undefined;
    }
    
    public get isConfigurable(): boolean {
        return this.m_propertyDescriptor.configurable === undefined
            ? false
            : this.m_propertyDescriptor.configurable;
    }
    
    public get isEnumerable(): boolean {
        return this.m_propertyDescriptor.enumerable === undefined
            ? false
            : this.m_propertyDescriptor.enumerable;
    }
    
    public get isWritable(): boolean {
        return this.m_propertyDescriptor.writable === undefined
            ? false
            : this.m_propertyDescriptor.writable;
    }
    
    private constructor(constructor: Constructor, name: string, propertyDescriptor: PropertyDescriptor) {
        this.m_constructor = constructor;
        this.m_name = name;
        this.m_propertyDescriptor = propertyDescriptor;
    }
    
    public get(target: Object): any {
        if (this.isVirtual) {
            if (this.m_propertyDescriptor.get === undefined) {
                throw new Error();
            }
            
            return this.m_propertyDescriptor.get.call(target);
        }
        
        return (target as any)[this.m_name];
    }
    
    public set(target: Object, value: any): void {
        if (this.isVirtual) {
            if (this.m_propertyDescriptor.set === undefined) {
                throw new Error();
            }
            
            return this.m_propertyDescriptor.set.call(target, value);
        }
        
        (target as any)[this.m_name] = value;
    }

}
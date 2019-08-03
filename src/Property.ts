import Reflection, { Constructor } from './Reflection';
import Type from './Type';

export default class Property {
    
    private static m_shallow: Map<Constructor, Map<string, Property>> = new Map();
    
    private static m_deep: Map<Constructor, Map<string, Property>> = new Map();
    
    public static of(constructor: Constructor, isDeep: boolean = true): Map<string, Property> {
        return isDeep
            ? Property.deep(constructor)
            : Property.shallow(constructor);
    }
    
    private static shallow(constructor: Constructor): Map<string, Property> {
        if (!Property.m_shallow.has(constructor)) {
            const properties = Object.getOwnPropertyNames(constructor.prototype)
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
            
            Property.m_shallow.set(constructor, properties);
        }
        
        return Property.m_shallow.get(constructor) as Map<string, Property>;
    }
    
    private static deep(constructor: Constructor): Map<string, Property> {
        if (!Property.m_deep.has(constructor)) {
            const prototypes = Reflection.prototypes(constructor);
        
            const properties = Array.from(prototypes)
                .reduce(
                    (state: Map<string, Property>, constructor: Constructor): Map<string, Property> => {
                        const properties = Property.shallow(constructor);
                        properties.forEach((property: Property): Map<string, Property> => state.set(property.name, property));
                        return state;
                    },
                    new Map()
                );
                
            Property.m_deep.set(constructor, properties);
        }
        
        return Property.m_deep.get(constructor) as Map<string, Property>;
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
    
    private constructor(constructor: Constructor, name: string, propertyDescriptor: PropertyDescriptor) {
        this.m_constructor = constructor;
        this.m_name = name;
        this.m_propertyDescriptor = propertyDescriptor;
    }
    
    public get(target: Object): any {
        if (this.m_propertyDescriptor.get === undefined) {
            throw new Error(this.m_constructor.name);
        }
        
        return this.m_propertyDescriptor.get.call(target);
    }
    
    public set(target: Object, value: any): void {
        if (this.m_propertyDescriptor.set === undefined) {
            throw new Error(this.m_constructor.name);
        }
        
        this.m_propertyDescriptor.set.call(target, value);
    }

}
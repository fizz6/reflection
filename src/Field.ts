import Reflection, { Constructor } from './Reflection';

export interface Constructor {
    new (...args: any[]): Object;
}

export default class Field {
    
    private static m_shallow: Map<Constructor, Map<string, Field>> = new Map();
    
    private static m_deep: Map<Constructor, Map<string, Field>> = new Map();
    
    // public static Shallow(constructor: Constructor): Map<string, Field> {
    //     if (!Field.m_shallow.has(constructor)) {
    //         const fields = Object.getOwnPropertyNames(constructor.prototype)
    //             .reduce(
    //                 (state: Map<string, Field>, propertyName: string): Map<string, Field> => {
    //                     if (propertyName === 'constructor') {
    //                         return state;
    //                     }
                        
    //                     const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName) as PropertyDescriptor;
    //                     if (descriptor.value === undefined || descriptor.get !== undefined || descriptor.set !== undefined) {
    //                         return state;
    //                     }
                        
    //                     const field = new Field(constructor, propertyName, descriptor);
    //                     return state.set(propertyName, field);
    //                 },
    //                 new Map()
    //             );
            
    //         Field.m_shallow.set(constructor, fields);
    //     }
        
    //     return Field.m_shallow.get(constructor) as Map<string, Field>;
    // }
    
    public static Deep(constructor: Constructor): Map<string, Field> {
        if (!Field.m_deep.has(constructor)) {
            let instance: Object;
            try {
                instance = new constructor();
            } catch {
                throw new Error(constructor.name);
            }
        
            const fields = Object.getOwnPropertyNames(instance)
                .reduce(
                    (state: Map<string, Field>, propertyName: string): Map<string, Field> => {
                        const propertyDescriptor = Object.getOwnPropertyDescriptor(instance, propertyName) as PropertyDescriptor;
                        const field = new Field(constructor, propertyName, propertyDescriptor);
                        return state.set(propertyName, field);
                    },
                    new Map()
                );
                
            Field.m_deep.set(constructor, fields);
        }
        
        return Field.m_deep.get(constructor) as Map<string, Field>;
    }
    
    private m_constructor: Constructor;
    
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
        return (target as any)[this.m_name];
    }
    
    public set(target: Object, value: any): void {
        (target as any)[this.m_name] = value;
    }
    
}
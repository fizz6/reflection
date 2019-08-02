import Reflection from './Reflection';

export interface Constructor {
    new (...args: any[]): Object;
}

export default class Method {
    
    private static m_shallow: Map<Constructor, Map<string, Method>> = new Map();
    
    private static m_deep: Map<Constructor, Map<string, Method>> = new Map();
    
    public static Shallow(constructor: Constructor): Map<string, Method> {
        if (!Method.m_shallow.has(constructor)) {
            const methods = Object.getOwnPropertyNames(constructor.prototype)
                .reduce(
                    (state: Map<string, Method>, propertyName: string): Map<string, Method> => {
                        if (propertyName === 'constructor') {
                            return state;
                        }
                        
                        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName) as PropertyDescriptor;
                        
                        if (descriptor.get !== undefined || descriptor.set !== undefined) {
                            if (descriptor.get !== undefined) {
                                const getter = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName) as PropertyDescriptor;
                                getter.value = descriptor.get;
                                const getterName = `get_${propertyName}`;
                                const method = new Method(getterName, getter);
                                state.set(getterName, method);
                            }
                            
                            if (descriptor.set !== undefined) {
                                const setter = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName) as PropertyDescriptor;
                                setter.value = descriptor.set;
                                const setterName = `set_${propertyName}`;
                                const method = new Method(setterName, setter);
                                state.set(setterName, method);
                            }
                            
                            return state;
                        }
                        
                        const method = new Method(propertyName, descriptor);
                        return state.set(propertyName, method);
                    },
                    new Map()
                );
            
            Method.m_shallow.set(constructor, methods);
        }
        
        return Method.m_shallow.get(constructor) as Map<string, Method>;
    }
    
    public static Deep(constructor: Constructor): Map<string, Method> {
        if (!Method.m_deep.has(constructor)) {
            const prototypes = Reflection.Prototypes(constructor);
        
            const methods = Array.from(prototypes)
                .reduce(
                    (state: Map<string, Method>, constructor: Constructor): Map<string, Method> => {
                        const methods = Method.Shallow(constructor);
                        methods.forEach((method: Method): Map<string, Method> => state.set(method.name, method));
                        return state;
                    },
                    new Map()
                );
                
            Method.m_deep.set(constructor, methods);
        }
        
        return Method.m_deep.get(constructor) as Map<string, Method>;
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
    
    private constructor(name: string, propertyDescriptor: PropertyDescriptor) {
        this.m_name = name;
        this.m_propertyDescriptor = propertyDescriptor;
    }
    
    public invoke(target: Object, ...args: any[]): any {
        if (!(this.m_propertyDescriptor.value instanceof Function)) {
            throw new Error(`'${this.m_propertyDescriptor.value}' cannot be invoked`)
        }
        
        return (this.m_propertyDescriptor.value as Function).call(target, ...args);
    }
    
}
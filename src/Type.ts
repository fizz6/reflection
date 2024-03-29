import Reflection, { Constructor } from './Reflection';
import Field from './Field';
import Method from './Method';
import Property from './Property';

export default class Type {
    
    private static m_values: Set<string> = new Set([ 'Null', 'Undefined', 'Boolean', 'Number', 'String', 'Symbol' ]);
    
    public static get values(): Set<string> {
        return Type.m_values;
    }
    
    private static m_cache: Map<Constructor, Type> = new Map();
    
    public static of(constructor: Constructor): Type {
        if (!Type.m_cache.has(constructor)) {
            const type = new Type(constructor);
            Type.m_cache.set(constructor, type);
        }
        
        return Type.m_cache.get(constructor) as Type;
    }
    
    private m_constructor: Constructor;
    
    private m_methods?: Map<string, Method>;
    
    public get methods(): Map<string, Method> {
        if (this.m_methods === undefined) {
            this.m_methods = Method.of(this.m_constructor);
        }
        
        return this.m_methods;
    }
    
    private m_properties?: Map<string, Property>;
    
    public get properties(): Map<string, Property> {
        if (this.m_properties === undefined) {
            this.m_properties = Property.of(this.m_constructor);
        }
        
        return this.m_properties;
    }
    
    private m_fields?: Map<string, Field>;
    
    public get fields(): Map<string, Field> {
        if (this.m_fields === undefined) {
            this.m_fields = Field.of(this.m_constructor);
        }
        
        return this.m_fields;
    }
    
    public get prototypes(): Set<Constructor> {
        return Reflection.prototypes(this.m_constructor);
    }
    
    private constructor(constructor: Constructor) {
        this.m_constructor = constructor;
    }
    
}
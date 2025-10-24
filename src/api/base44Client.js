// Supabase-based API Client
// All operations use Supabase directly

class Base44Entity {
  constructor(entityName, tableName = null) {
    this.entityName = entityName;
    // Convert entity name to table name (snake_case)
    this.tableName = tableName || this.toSnakeCase(entityName);
  }

  toSnakeCase(str) {
    // Convert PascalCase/camelCase to snake_case
    // Event -> events, Speaker -> speakers, EventOrder -> event_orders
    const snake = str.replace(/([A-Z])/g, '_$1').toLowerCase();
    const cleaned = snake.startsWith('_') ? snake.slice(1) : snake;
    // Pluralize (simple approach)
    return cleaned.endsWith('s') ? cleaned : `${cleaned}s`;
  }

  async getSupabase() {
    const { supabase } = await import('../lib/supabase.js');
    return supabase;
  }

  async list(sortOrder = null, limit = 100) {
    try {
      const supabase = await this.getSupabase();
      let query = supabase.from(this.tableName).select('*').limit(limit);

      if (sortOrder) {
        // sortOrder can be "field" or "-field" for descending
        const descending = sortOrder.startsWith('-');
        const field = descending ? sortOrder.slice(1) : sortOrder;
        query = query.order(field, { ascending: !descending });
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch ${this.entityName} list: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`Error listing ${this.entityName}:`, error);
      throw error;
    }
  }

  async get(id) {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch ${this.entityName} with id ${id}: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`Error getting ${this.entityName}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const supabase = await this.getSupabase();
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create ${this.entityName}: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error(`Error creating ${this.entityName}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const supabase = await this.getSupabase();
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update ${this.entityName} with id ${id}: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error(`Error updating ${this.entityName}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const supabase = await this.getSupabase();
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete ${this.entityName} with id ${id}: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${this.entityName}:`, error);
      throw error;
    }
  }
}

class UserEntity extends Base44Entity {
  constructor() {
    // Specify the exact table name for user_profiles
    super('User', 'user_profiles');
  }

  async me() {
    try {
      const supabase = await this.getSupabase();

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Get user profile from user_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async createComplete(userData) {
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

      // Importar cliente de supabase para obtener el token del usuario actual
      const { supabase } = await import('../lib/supabase.js');

      // Obtener la sesión actual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session. Please login first.');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating complete user:', error);
      throw error;
    }
  }
}

class Base44Client {
  constructor() {
    this.entities = {
      Event: new Base44Entity('Event', 'events'),
      Speaker: new Base44Entity('Speaker', 'speakers'),
      Venue: new Base44Entity('Venue', 'venues'),
      City: new Base44Entity('City', 'cities'),
      User: new UserEntity(),
      OrderType: new Base44Entity('OrderType', 'order_types'),
      EventOrder: new Base44Entity('EventOrder', 'event_orders'),
    };
  }
}

export const base44 = new Base44Client();

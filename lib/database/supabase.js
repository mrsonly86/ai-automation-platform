/**
 * Supabase Database Client
 * Free tier: 500MB PostgreSQL + Auth + Real-time
 */

// Check if we're in a browser environment
const isClient = typeof window !== 'undefined';

let supabase, supabaseAdmin;

// Initialize Supabase clients
async function initializeSupabase() {
  if (isClient) {
    // Client-side initialization
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase configuration missing. Please check your environment variables.');
      return null;
    }
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    return supabase;
  } else {
    // Server-side initialization
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase configuration missing. Please check your environment variables.');
      return null;
    }
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    if (supabaseServiceRoleKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    
    return { supabase, supabaseAdmin };
  }
}

// Initialize on module load
let initPromise = initializeSupabase();

/**
 * Get Supabase client instance
 */
export async function getSupabase() {
  if (!supabase) {
    await initPromise;
  }
  return supabase;
}

/**
 * Get Supabase admin client (server-side only)
 */
export async function getSupabaseAdmin() {
  if (isClient) {
    throw new Error('Admin client not available in browser environment');
  }
  
  if (!supabaseAdmin) {
    await initPromise;
  }
  return supabaseAdmin;
}

/**
 * Database operations wrapper
 */
export const db = {
  // Profile operations
  async getProfile(userId) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    return data;
  },

  async createProfile(userId, profileData) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProfile(userId) {
    const client = await getSupabase();
    const { error } = await client
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  },

  // Conversation operations
  async createConversation(userId, title, model) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation',
        model_used: model,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getConversations(userId, options = {}) {
    const client = await getSupabase();
    const { 
      limit = 50, 
      offset = 0, 
      orderBy = 'created_at',
      ascending = false 
    } = options;
    
    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  async getConversation(conversationId, userId) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConversation(conversationId, userId, updates) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteConversation(conversationId, userId) {
    const client = await getSupabase();
    const { error } = await client
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  // Message operations
  async addMessage(conversationId, role, content, tokensUsed = 0) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        tokens_used: tokensUsed,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMessages(conversationId, options = {}) {
    const client = await getSupabase();
    const { 
      limit = 100, 
      offset = 0,
      orderBy = 'created_at',
      ascending = true 
    } = options;
    
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  async deleteMessage(messageId) {
    const client = await getSupabase();
    const { error } = await client
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) throw error;
    return true;
  },

  // Usage tracking
  async logUsage(userId, provider, model, tokensUsed, requestType, costCredits = 0) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('usage_logs')
      .insert({
        user_id: userId,
        provider,
        model,
        tokens_used: tokensUsed,
        request_type: requestType,
        cost_credits: costCredits,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserUsage(userId, options = {}) {
    const client = await getSupabase();
    const { 
      days = 30, 
      provider = null, 
      requestType = null,
      limit = 1000 
    } = options;
    
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    let query = client
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (provider) {
      query = query.eq('provider', provider);
    }
    
    if (requestType) {
      query = query.eq('request_type', requestType);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getUsageStats(userId, days = 30) {
    const client = await getSupabase();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    const { data, error } = await client
      .from('usage_logs')
      .select('provider, tokens_used, cost_credits, request_type')
      .eq('user_id', userId)
      .gte('created_at', fromDate.toISOString());
    
    if (error) throw error;
    
    // Aggregate stats
    const stats = {
      totalTokens: 0,
      totalCredits: 0,
      byProvider: {},
      byRequestType: {},
      byDay: {}
    };
    
    (data || []).forEach(log => {
      stats.totalTokens += log.tokens_used;
      stats.totalCredits += log.cost_credits;
      
      // By provider
      if (!stats.byProvider[log.provider]) {
        stats.byProvider[log.provider] = { tokens: 0, credits: 0, requests: 0 };
      }
      stats.byProvider[log.provider].tokens += log.tokens_used;
      stats.byProvider[log.provider].credits += log.cost_credits;
      stats.byProvider[log.provider].requests += 1;
      
      // By request type
      if (!stats.byRequestType[log.request_type]) {
        stats.byRequestType[log.request_type] = { tokens: 0, credits: 0, requests: 0 };
      }
      stats.byRequestType[log.request_type].tokens += log.tokens_used;
      stats.byRequestType[log.request_type].credits += log.cost_credits;
      stats.byRequestType[log.request_type].requests += 1;
    });
    
    return stats;
  },

  // Workflow operations
  async createWorkflow(userId, name, description, config) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('workflows')
      .insert({
        user_id: userId,
        name,
        description,
        config,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWorkflows(userId, options = {}) {
    const client = await getSupabase();
    const { 
      isActive = null, 
      limit = 50, 
      offset = 0 
    } = options;
    
    let query = client
      .from('workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (isActive !== null) {
      query = query.eq('is_active', isActive);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async updateWorkflow(workflowId, userId, updates) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteWorkflow(workflowId, userId) {
    const client = await getSupabase();
    const { error } = await client
      .from('workflows')
      .delete()
      .eq('id', workflowId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  // Workflow execution operations
  async createWorkflowExecution(workflowId, inputData = {}) {
    const client = await getSupabase();
    const { data, error } = await client
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        status: 'pending',
        input_data: inputData,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWorkflowExecution(executionId, updates) {
    const client = await getSupabase();
    const updateData = { ...updates };
    
    if (updates.status === 'completed' || updates.status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await client
      .from('workflow_executions')
      .update(updateData)
      .eq('id', executionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWorkflowExecutions(workflowId, options = {}) {
    const client = await getSupabase();
    const { 
      status = null, 
      limit = 50, 
      offset = 0 
    } = options;
    
    let query = client
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }
};

/**
 * Real-time subscriptions
 */
export const realtime = {
  async subscribeToConversation(conversationId, callback) {
    const client = await getSupabase();
    return client
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  },

  async subscribeToUserUsage(userId, callback) {
    const client = await getSupabase();
    return client
      .channel(`usage-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'usage_logs',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  async subscribeToWorkflowExecutions(workflowId, callback) {
    const client = await getSupabase();
    return client
      .channel(`workflow-${workflowId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workflow_executions',
        filter: `workflow_id=eq.${workflowId}`
      }, callback)
      .subscribe();
  }
};

/**
 * Authentication helpers
 */
export const auth = {
  async getCurrentUser() {
    const client = await getSupabase();
    const { data: { user } } = await client.auth.getUser();
    return user;
  },

  async signInWithProvider(provider) {
    const client = await getSupabase();
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const client = await getSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback) {
    const client = getSupabase();
    return client.auth.onAuthStateChange(callback);
  }
};

/**
 * Storage operations (for file uploads)
 */
export const storage = {
  async uploadFile(bucket, path, file) {
    const client = await getSupabase();
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  async downloadFile(bucket, path) {
    const client = await getSupabase();
    const { data, error } = await client.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  },

  async getPublicUrl(bucket, path) {
    const client = await getSupabase();
    const { data } = client.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async deleteFile(bucket, path) {
    const client = await getSupabase();
    const { error } = await client.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Health check and connection status
 */
export async function checkDatabaseHealth() {
  try {
    const client = await getSupabase();
    const { data, error } = await client
      .from('profiles')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Database migration helper (for initial setup)
 */
export async function ensureUserProfile(user) {
  if (!user) return null;
  
  try {
    let profile = await db.getProfile(user.id);
    
    if (!profile) {
      profile = await db.createProfile(user.id, {
        username: user.user_metadata?.username || user.email?.split('@')[0],
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
        credits: 100 // Initial free credits
      });
    }
    
    return profile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    throw error;
  }
}

export default {
  db,
  realtime,
  auth,
  storage,
  checkDatabaseHealth,
  ensureUserProfile,
  getSupabase,
  getSupabaseAdmin
};
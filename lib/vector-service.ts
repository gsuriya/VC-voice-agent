import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

let pinecone: Pinecone | null = null;
let vectorIndex: any = null;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone connection
export async function initializePinecone() {
  if (!pinecone) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }

    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log('✅ Pinecone client initialized');
  }

  if (!vectorIndex) {
    const indexName = process.env.PINECONE_INDEX_NAME || 'email-vectors';
    
    try {
      vectorIndex = pinecone.index(indexName);
      console.log(`✅ Connected to Pinecone index: ${indexName}`);
    } catch (error) {
      console.error('❌ Failed to connect to Pinecone index:', error);
      throw new Error(`Failed to connect to Pinecone index: ${indexName}`);
    }
  }

  return { pinecone, vectorIndex };
}

// Generate embeddings using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Removed verbose logging for performance
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // 1536 dimensions, cost-effective
      input: text.trim(),
    });

    const embedding = response.data[0].embedding;
    // Removed verbose logging for performance
    
    return embedding;
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
    throw error;
  }
}

// Store vector in Pinecone
export async function storeVector(
  id: string,
  text: string,
  metadata: Record<string, any> = {}
) {
  try {
    await initializePinecone();
    
    // Removed verbose logging for performance
    
    // Generate embedding
    const embedding = await generateEmbedding(text);
    
    // Store in Pinecone
    await vectorIndex.upsert([
      {
        id,
        values: embedding,
        metadata: {
          text: text.substring(0, 1000), // Store first 1000 chars for debugging
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      },
    ]);

    // Removed verbose logging for performance
    return true;
  } catch (error) {
    console.error(`❌ Error storing vector ${id}:`, error);
    throw error;
  }
}

// Search vectors by similarity
export async function searchVectors(
  query: string,
  topK: number = 10,
  filter: Record<string, any> = {},
  namespace?: string
) {
  try {
    await initializePinecone();
    
    console.log(`🔍 Searching vectors for query: "${query}"`);
    
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Search in Pinecone
    const searchRequest: any = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      includeValues: false, // Don't return the vectors themselves
    };

    // Add filter if provided
    if (Object.keys(filter).length > 0) {
      searchRequest.filter = filter;
    }

    // Query with namespace if provided
    const results = namespace
      ? await vectorIndex.namespace(namespace).query(searchRequest)
      : await vectorIndex.query(searchRequest);
    
    console.log(`✅ Found ${results.matches?.length || 0} similar vectors`);
    
    return results.matches || [];
  } catch (error) {
    console.error('❌ Error searching vectors:', error);
    throw error;
  }
}

// Test Pinecone connection
export async function testPineconeConnection() {
  try {
    console.log('🧪 Testing Pinecone connection...');
    
    await initializePinecone();
    
    // Test with a simple vector
    const testId = `test-${Date.now()}`;
    const testText = "This is a test email about a meeting with John Smith regarding the quarterly review.";
    
    // Store test vector
    await storeVector(testId, testText, {
      type: 'test',
      from: 'test@example.com',
      subject: 'Test Email',
    });
    
    // Search for it
    const results = await searchVectors("meeting with John", 5, { type: 'test' });
    
    if (results.length > 0) {
      console.log('✅ Pinecone connection test PASSED');
      console.log('🔍 Test search results:', results[0]);
      
      // Clean up test data
      await vectorIndex.deleteOne(testId);
      console.log('🧹 Test data cleaned up');
      
      return { success: true, message: 'Pinecone is working correctly!' };
    } else {
      throw new Error('No results found for test query');
    }
  } catch (error) {
    console.error('❌ Pinecone connection test FAILED:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Pinecone connection failed. Check your API key and index setup.'
    };
  }
}

// Get index stats
export async function getIndexStats() {
  try {
    await initializePinecone();
    
    const stats = await vectorIndex.describeIndexStats();
    console.log('📊 Index stats:', stats);
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting index stats:', error);
    throw error;
  }
}

// Batch store multiple vectors (for bulk email import)
export async function batchStoreVectors(
  vectors: Array<{
    id: string;
    text: string;
    metadata?: Record<string, any>;
  }>,
  namespace?: string
) {
  try {
    await initializePinecone();
    
    console.log(`📤 Batch storing ${vectors.length} vectors...`);
    
    const batchSize = 10; // Smaller batch size for better progress tracking
    const results = [];
    
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      
      // Log only every 100 emails for performance
      if (i % 100 === 0 || i + batch.length === vectors.length) {
        console.log(`📦 Processing: ${i + batch.length}/${vectors.length} emails (${Math.round((i + batch.length) / vectors.length * 100)}%)`);
      }
      
      // Generate embeddings for batch with progress
      const vectorData = await Promise.all(
        batch.map(async (item, idx) => {
          // Removed per-email logging for performance
          const embedding = await generateEmbedding(item.text);
          return {
            id: item.id,
            values: embedding,
            metadata: {
              text: item.text.substring(0, 1000),
              timestamp: new Date().toISOString(),
              ...item.metadata,
            },
          };
        })
      );
      
      // Upsert batch to Pinecone with namespace
      if (namespace) {
        await vectorIndex.namespace(namespace).upsert(vectorData);
      } else {
        await vectorIndex.upsert(vectorData);
      }
      results.push(...vectorData.map(v => v.id));
      
      // Small delay to avoid rate limits
      if (i + batchSize < vectors.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Batch storage complete: ${results.length} vectors stored`);
    return results;
  } catch (error) {
    console.error('❌ Error in batch storage:', error);
    throw error;
  }
}

export default {
  initializePinecone,
  generateEmbedding,
  storeVector,
  searchVectors,
  testPineconeConnection,
  getIndexStats,
  batchStoreVectors,
};

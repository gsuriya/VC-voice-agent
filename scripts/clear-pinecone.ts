import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

async function clearPinecone() {
  try {
    console.log('🗑️  Initializing Pinecone client...');
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || 'email-vectors';
    const index = pinecone.index(indexName);

    console.log(`📌 Connected to index: ${indexName}`);

    // Get all namespaces
    const stats = await index.describeIndexStats();
    console.log('📊 Current index stats:', stats);

    // Delete all vectors from all namespaces
    if (stats.namespaces) {
      for (const namespace in stats.namespaces) {
        if (namespace === '') {
          console.log('🧹 Deleting all vectors from default namespace');
          try {
            // For default namespace, we need to delete by filter
            await index.deleteMany({ filter: {} });
          } catch (e) {
            console.log('Could not delete from default namespace:', e);
          }
        } else {
          console.log(`🧹 Deleting all vectors from namespace: ${namespace}`);
          try {
            // Delete all from specific namespace
            await index.namespace(namespace).deleteAll();
          } catch (e) {
            console.log(`Could not delete from namespace ${namespace}:`, e);
          }
        }
      }
    }

    // Verify deletion
    const newStats = await index.describeIndexStats();
    console.log('✅ Index cleared. New stats:', newStats);

  } catch (error) {
    console.error('❌ Error clearing Pinecone:', error);
  }
}

clearPinecone();

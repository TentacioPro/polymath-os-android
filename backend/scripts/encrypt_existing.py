#!/usr/bin/env python3
"""
Migration Script: Encrypt Existing Sensitive Data

This script migrates existing plaintext sensitive data to encrypted format.
Run this ONCE after setting up ENCRYPTION_KEY environment variable.

Usage:
    cd backend
    .venv/Scripts/activate  # or source .venv/bin/activate on Unix
    python scripts/encrypt_existing.py

WARNING: 
    - Backup your database before running this script
    - This is a one-way migration - encrypted data cannot be decrypted without the key
    - Run in development first to verify the migration works correctly
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment
load_dotenv(Path(__file__).parent.parent / '.env')

# Import after loading env
from crypto import field_encryptor, is_encryption_enabled


async def migrate_ai_configs(db):
    """Encrypt API keys in AI configurations."""
    if not is_encryption_enabled():
        print("  [SKIP] Encryption not enabled - skipping AI config migration")
        return 0
    
    count = 0
    cursor = db.ai_configs.find({})
    
    async for doc in cursor:
        api_key = doc.get('api_key', '')
        
        # Skip if already encrypted
        if api_key.startswith('enc:v1:'):
            continue
        
        # Skip if empty
        if not api_key:
            continue
        
        # Encrypt and update
        encrypted_key = field_encryptor.encrypt(api_key)
        await db.ai_configs.update_one(
            {'_id': doc['_id']},
            {'$set': {'api_key': encrypted_key}}
        )
        count += 1
        print(f"    Encrypted AI config: {doc.get('provider', 'unknown')}/{doc.get('model', 'unknown')}")
    
    return count


async def migrate_agent_memories(db):
    """Optionally encrypt agent memory content (personal insights)."""
    if not is_encryption_enabled():
        print("  [SKIP] Encryption not enabled - skipping agent memory migration")
        return 0
    
    # Only encrypt specific memory types that contain personal insights
    sensitive_types = ['insight', 'pattern', 'long_term']
    count = 0
    
    cursor = db.agent_memory.find({'memory_type': {'$in': sensitive_types}})
    
    async for doc in cursor:
        content = doc.get('content', '')
        
        # Skip if already encrypted
        if content.startswith('enc:v1:'):
            continue
        
        # Skip if empty
        if not content:
            continue
        
        # Encrypt and update
        encrypted_content = field_encryptor.encrypt(content)
        await db.agent_memory.update_one(
            {'_id': doc['_id']},
            {'$set': {'content': encrypted_content}}
        )
        count += 1
    
    if count > 0:
        print(f"    Encrypted {count} agent memory entries")
    
    return count


async def create_indexes(db):
    """Create database indexes for new collections."""
    print("\n[3/4] Creating database indexes...")
    
    # Users collection
    await db.users.create_index('email', unique=True)
    await db.users.create_index('id', unique=True)
    print("    Created users indexes")
    
    # Refresh tokens collection
    await db.refresh_tokens.create_index('token_hash')
    await db.refresh_tokens.create_index('user_id')
    await db.refresh_tokens.create_index([('expires_at', 1)], expireAfterSeconds=0)
    print("    Created refresh_tokens indexes")
    
    # Audit logs collection
    await db.audit_logs.create_index('user_id')
    await db.audit_logs.create_index('timestamp')
    await db.audit_logs.create_index('action')
    await db.audit_logs.create_index([('timestamp', -1)])
    print("    Created audit_logs indexes")


async def verify_migration(db):
    """Verify migration was successful."""
    print("\n[4/4] Verifying migration...")
    
    # Check AI configs
    ai_configs = await db.ai_configs.find({}).to_list(100)
    encrypted_count = sum(1 for c in ai_configs if c.get('api_key', '').startswith('enc:v1:'))
    total_count = len(ai_configs)
    print(f"    AI Configs: {encrypted_count}/{total_count} encrypted")
    
    # Check agent memories
    sensitive_memories = await db.agent_memory.find({
        'memory_type': {'$in': ['insight', 'pattern', 'long_term']}
    }).to_list(1000)
    encrypted_memories = sum(1 for m in sensitive_memories if m.get('content', '').startswith('enc:v1:'))
    print(f"    Agent Memories: {encrypted_memories}/{len(sensitive_memories)} encrypted")
    
    # Check indexes
    user_indexes = await db.users.index_information()
    print(f"    Users indexes: {len(user_indexes)}")
    
    audit_indexes = await db.audit_logs.index_information()
    print(f"    Audit logs indexes: {len(audit_indexes)}")


async def main():
    """Run the migration."""
    print("=" * 60)
    print("Polymath OS - Security Migration Script")
    print("=" * 60)
    
    # Check encryption status
    print("\n[1/4] Checking encryption configuration...")
    if is_encryption_enabled():
        print("    Field encryption: ENABLED")
    else:
        print("    Field encryption: DISABLED")
        print("    Set ENCRYPTION_KEY in .env to enable field-level encryption")
    
    # Connect to database
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("\n[ERROR] MONGO_URL and DB_NAME must be set in environment")
        return
    
    print(f"    Database: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Test connection
    try:
        await db.command('ping')
        print("    Connection: OK")
    except Exception as e:
        print(f"\n[ERROR] Failed to connect to database: {e}")
        return
    
    # Run migrations
    print("\n[2/4] Migrating sensitive data...")
    
    ai_count = await migrate_ai_configs(db)
    memory_count = await migrate_agent_memories(db)
    
    print(f"    Total AI configs encrypted: {ai_count}")
    print(f"    Total memories encrypted: {memory_count}")
    
    # Create indexes
    await create_indexes(db)
    
    # Verify
    await verify_migration(db)
    
    # Cleanup
    client.close()
    
    print("\n" + "=" * 60)
    print("Migration complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Verify application works correctly")
    print("2. Test login/register flows")
    print("3. Test data encryption/decryption")
    print("4. Monitor audit_logs collection for security events")


if __name__ == '__main__':
    asyncio.run(main())

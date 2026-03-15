"""
Field-Level Encryption Utilities for Polymath OS

Uses AES-256-GCM authenticated encryption for sensitive data at rest.
Each encrypted value includes a random nonce for unique ciphertext.

Usage:
    from crypto import field_encryptor
    
    # Encrypt sensitive data before storing
    encrypted_api_key = field_encryptor.encrypt(api_key)
    
    # Decrypt when retrieving
    api_key = field_encryptor.decrypt(encrypted_api_key)
"""

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os
import base64
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Get encryption key from environment
# Must be a 32-byte (256-bit) key, base64 encoded
ENCRYPTION_KEY_ENV = os.environ.get('ENCRYPTION_KEY', '')

# Salt for key derivation (can be stored openly, but should be consistent)
KEY_DERIVATION_SALT = b'polymath_os_v1_salt_2026'


class FieldEncryptor:
    """
    AES-256-GCM encryption for sensitive fields.
    
    Features:
    - Authenticated encryption (integrity + confidentiality)
    - Random 12-byte nonce per encryption (prevents pattern analysis)
    - Base64 encoding for database storage compatibility
    - Graceful fallback for development mode
    """
    
    def __init__(self, key: Optional[bytes] = None):
        """
        Initialize encryptor with a 32-byte key.
        
        Args:
            key: 32-byte encryption key. If None, derives from ENCRYPTION_KEY env var.
        """
        self._aesgcm: Optional[AESGCM] = None
        self._enabled = False
        
        if key:
            self._init_cipher(key)
        elif ENCRYPTION_KEY_ENV:
            try:
                # Derive a proper 256-bit key from the environment variable
                derived_key = self._derive_key(ENCRYPTION_KEY_ENV)
                self._init_cipher(derived_key)
            except Exception as e:
                logger.warning(f"Failed to initialize encryption: {e}. Encryption disabled.")
        else:
            logger.info("ENCRYPTION_KEY not set. Field encryption disabled (development mode).")
    
    def _derive_key(self, password: str) -> bytes:
        """Derive a 256-bit key from a password using PBKDF2."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=KEY_DERIVATION_SALT,
            iterations=100_000,
        )
        return kdf.derive(password.encode())
    
    def _init_cipher(self, key: bytes):
        """Initialize the AES-GCM cipher with the given key."""
        if len(key) != 32:
            raise ValueError("Encryption key must be exactly 32 bytes (256 bits)")
        self._aesgcm = AESGCM(key)
        self._enabled = True
        logger.info("Field encryption initialized successfully.")
    
    @property
    def is_enabled(self) -> bool:
        """Check if encryption is enabled."""
        return self._enabled
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt a string value.
        
        Args:
            plaintext: The string to encrypt.
            
        Returns:
            Base64-encoded encrypted value (nonce + ciphertext).
            If encryption is disabled, returns the plaintext unchanged.
        """
        if not plaintext:
            return plaintext
        
        if not self._enabled:
            # In development mode, return plaintext with marker
            return plaintext
        
        try:
            # Generate random 12-byte nonce
            nonce = os.urandom(12)
            
            # Encrypt with authentication
            ciphertext = self._aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
            
            # Combine nonce + ciphertext and base64 encode
            encrypted = base64.b64encode(nonce + ciphertext).decode('utf-8')
            
            # Add prefix to identify encrypted values
            return f"enc:v1:{encrypted}"
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise ValueError("Failed to encrypt data") from e
    
    def decrypt(self, encrypted: str) -> str:
        """
        Decrypt an encrypted string value.
        
        Args:
            encrypted: Base64-encoded encrypted value or plaintext.
            
        Returns:
            The decrypted plaintext string.
            If the value is not encrypted (no prefix), returns as-is.
        """
        if not encrypted:
            return encrypted
        
        # Check for encryption prefix
        if not encrypted.startswith("enc:v1:"):
            # Not encrypted, return as-is (backward compatibility)
            return encrypted
        
        if not self._enabled:
            logger.warning("Attempting to decrypt without encryption key configured.")
            raise ValueError("Encryption key not configured")
        
        try:
            # Remove prefix
            encrypted_data = encrypted[7:]  # Remove "enc:v1:"
            
            # Decode base64
            data = base64.b64decode(encrypted_data)
            
            # Split nonce and ciphertext
            nonce = data[:12]
            ciphertext = data[12:]
            
            # Decrypt and authenticate
            plaintext = self._aesgcm.decrypt(nonce, ciphertext, None)
            
            return plaintext.decode('utf-8')
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise ValueError("Failed to decrypt data") from e
    
    def is_encrypted(self, value: str) -> bool:
        """Check if a value is encrypted."""
        return value.startswith("enc:v1:") if value else False
    
    def encrypt_dict_fields(self, data: dict, fields: list[str]) -> dict:
        """
        Encrypt specific fields in a dictionary.
        
        Args:
            data: Dictionary containing data.
            fields: List of field names to encrypt.
            
        Returns:
            Dictionary with specified fields encrypted.
        """
        result = data.copy()
        for field in fields:
            if field in result and result[field]:
                result[field] = self.encrypt(str(result[field]))
        return result
    
    def decrypt_dict_fields(self, data: dict, fields: list[str]) -> dict:
        """
        Decrypt specific fields in a dictionary.
        
        Args:
            data: Dictionary containing encrypted data.
            fields: List of field names to decrypt.
            
        Returns:
            Dictionary with specified fields decrypted.
        """
        result = data.copy()
        for field in fields:
            if field in result and result[field]:
                result[field] = self.decrypt(str(result[field]))
        return result


# Global instance - initialized when module loads
field_encryptor = FieldEncryptor()


# Convenience functions
def encrypt_field(value: str) -> str:
    """Encrypt a single field value."""
    return field_encryptor.encrypt(value)


def decrypt_field(value: str) -> str:
    """Decrypt a single field value."""
    return field_encryptor.decrypt(value)


def is_encryption_enabled() -> bool:
    """Check if field encryption is enabled."""
    return field_encryptor.is_enabled
